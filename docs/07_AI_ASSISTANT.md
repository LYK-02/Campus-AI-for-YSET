# Campus AI Assistant --- Functional and Technical Specification

## 1. Purpose

Provide a student-focused assistant that explains academic concepts,
answers questions about authorized documents, helps with revision, and
retrieves approved university information. The assistant is a learning
aid, not the authority for official records.

## 2. Modes

### GENERAL

General educational/programming help. Clearly distinguish model
knowledge from verified university facts.

### MY_DOCUMENTS

Search only documents owned by the current student or explicitly shared
with them.

### MY_COURSES

Search materials for courses in which the student is currently
authorized/enrolled. Faculty can use materials only for assigned
courses.

### UNIVERSITY_KNOWLEDGE

Search only approved and current institutional policies, notices, FAQs,
calendars, and other authoritative sources.

Mode is a server-validated enum. A client cannot override the system
prompt or request arbitrary unauthorized source IDs.

## 3. Chat UX requirements

-   New chat.
-   Chat history and search.
-   Rename and delete conversation.
-   Mode selection.
-   Message streaming where supported.
-   File upload with visible processing status.
-   Stop generation where supported.
-   Copy answer.
-   Regenerate answer.
-   Helpful/unhelpful feedback.
-   Follow-up suggestions.
-   Source citation cards with document title and page number when
    available.
-   Clear handling for unsupported file types, empty PDFs, processing
    errors, rate limits, and provider outages.

## 4. Document ingestion pipeline

1.  Authenticate the user.
2.  Validate upload quota, size, allowed type, MIME, and file signature.
3.  Generate a server-controlled storage key and upload to private
    storage.
4.  Store file metadata and ownership in PostgreSQL.
5.  Queue extraction if processing is not trivial.
6.  Extract text and page metadata.
7.  Normalize text and split into bounded chunks with overlap.
8.  Generate embeddings through an adapter if semantic retrieval is
    enabled.
9.  Store chunks and embeddings with material/tenant references.
10. Mark material processing status as `READY` or `FAILED`.
11. Allow authorized retrieval only after processing succeeds.

Do not treat a client-provided MIME type as trustworthy. Apply worker
timeouts and memory limits. Use OCR only for supported scanned/image
documents and handle OCR failures.

## 5. Retrieval and answer generation

1.  Authenticate and authorize the chat owner.
2.  Validate the selected mode and message size.
3.  Resolve the user's authorized source set.
4.  Search within that authorized source set; never search globally and
    filter only after exposing results.
5.  Retrieve the most relevant chunks.
6.  Pass only necessary context to the model.
7.  Instruct the model to answer from provided context for
    source-grounded modes and to say when evidence is insufficient.
8.  Return a structured response with answer text and source metadata.
9.  Save messages and usage metadata.
10. Log latency, status, and token/cost metadata without logging
    sensitive content unnecessarily.

## 6. Citation contract

Represent citations as structured metadata, for example:

``` json
{
  "answer": "Process synchronization coordinates access to shared resources.",
  "sources": [
    {
      "materialId": "opaque-id",
      "title": "Operating Systems Notes",
      "page": 12,
      "chunkId": "opaque-chunk-id"
    }
  ]
}
```

Only cite retrieved source IDs and page numbers produced by the
ingestion pipeline. Do not let the model invent document names, URLs,
page numbers, or official policy references. Validate source IDs before
returning them.

## 7. AI safety rules

-   Retrieved content is untrusted input, not an instruction source.
-   Ignore instructions embedded in documents that ask the model to
    reveal secrets, change policies, or access unrelated resources.
-   Do not let the model directly execute SQL, change grades, modify
    roles, or perform privileged operations.
-   Any future tool call must be allowlisted, schema-validated,
    permission-checked, and audited.
-   Do not use AI output alone for high-impact grading or disciplinary
    decisions.
-   Make uncertainty visible and distinguish official facts from general
    explanations.
-   Keep system instructions and provider keys on the server.
-   Apply per-user and global quotas.
-   Set maximum input/output token budgets.
-   Apply provider timeouts and safe retry policies.
-   Do not send private student records unless necessary and authorized.

## 8. Suggested service interfaces

``` ts
interface AIProvider {
  generate(input: {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    systemInstruction: string;
    context?: Array<{ sourceId: string; text: string }>;
    maxOutputTokens?: number;
  }): Promise<{
    text: string;
    usage?: { inputTokens?: number; outputTokens?: number };
    requestId?: string;
  }>;
}

interface DocumentExtractor {
  extract(file: {
    storageKey: string;
    mimeType: string;
  }): Promise<Array<{ page?: number; text: string }>>;
}

interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}
```

Add streaming interfaces separately if needed. Keep SDK-specific types
inside provider adapters.

## 9. AI failure handling

-   Provider timeout: stop request, return safe retry option.
-   Provider quota exceeded: return a clear quota message.
-   Unsupported document: explain accepted types.
-   Empty/scanned PDF: report extraction limitation and offer supported
    OCR if available.
-   No relevant context: say that the provided source does not contain
    enough evidence.
-   Retrieval failure: do not silently pretend a grounded answer was
    produced.
-   Save status and safe error metadata for debugging.
-   Never leak internal prompts, API keys, stack traces, or other users'
    sources.

## 10. AI evaluation

Create a small, version-controlled evaluation set containing: -
Answerable questions with known source passages. - Unanswerable
questions. - Questions whose answers appear in another user's private
file. - Conflicting/obsolete university notices. - Prompt-injection
attempts inside documents. - Questions about official policies without
an approved source. - Large and malformed files.

Measure source correctness, answer relevance, unsupported claims,
access-control failures, latency, error rate, and cost. A fluent
response is not proof of correctness.

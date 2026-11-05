# 13 · Scalability and performance

## Current performance mechanisms

- Cursor pagination in posts/jobs/users and limits in notification/message queries.
- Mongoose indexes on feed/sort and lookup fields.
- Redis adapter intended for multi-node Socket.IO room fanout; Redis hash presence with local fallback.
- Client request timeout of 30 seconds; Socket.IO reconnect/backoff.
- Cloudinary image transformations when configured.

No general response cache, queue/worker, bundle-analysis, code-splitting strategy, query metrics, load tests, or performance SLO was found. Redis is not evidence of cached REST responses.

## Likely bottlenecks to measure

1. Chat embeds message history in Chat documents; document size and writes grow over time.
2. Job applications are embedded and could grow without bound.
3. Feed/populate queries and search filters may need query-plan tuning at volume.
4. In-memory rate limits diverge across instances.
5. Redis presence state needs cleanup/expiry policy and can be stale after process failure.
6. Local upload disk does not scale across ephemeral or multiple API instances.
7. Socket event handlers and REST message controller duplicate behavior, creating consistency risk.
8. Frontend bundle size and render behavior have not been measured.

## Scaling path

Start with production-like metrics: endpoint latency, database explain plans, document sizes, active socket counts, memory/CPU, upload egress and bundle size. Then bound/paginate records, add indexes based on explain output, move files to durable object storage, use shared rate-limit storage, and authenticate sockets. For high chat volume, separate messages into their own collection with conversation IDs and indexes; this permits bounded documents and independent retention. Add a queue for email or expensive integrations only when synchronous latency/reliability warrants it. Horizontal API scaling requires shared Redis adapter, shared rate limits, stateless or shared sessions, compatible load balancing and durable storage.

Mongo options include better indexes, replica set, sharding or moving to relational storage depending on query and consistency needs. Do not assume Redis or microservices automatically improve throughput; each creates operational work and failure modes.

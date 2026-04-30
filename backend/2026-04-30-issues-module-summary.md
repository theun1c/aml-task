# Issues Module Summary

## Done
- Added `IssuesModule` and connected it in `AppModule`.
- Implemented `POST/GET/PATCH/DELETE` issue endpoints, backlog, sprint move, status change, and reorder.
- Added DTO validation and Swagger models for the `issues` API.
- Split internal logic into repository, access service, position service, and orchestration service for easier maintenance.

## Next
- Add full automated coverage for `issues` use cases and edge cases.
- Add Prisma migrations for reproducible schema rollout.
- Review concurrency strategy for `position` updates under parallel requests.
- Consider extracting shared project access rules if similar logic appears in other modules.

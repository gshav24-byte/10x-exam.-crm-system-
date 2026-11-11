📄 Research Note (research-note.md) — 10X CRM

This document details the technical research conducted using official English documentation during the implementation of the 10X CRM application.

🔗 Referenced Source

Document Name: DummyJSON Documentation — Users Resource

URL: https://dummyjson.com/docs/users

Search Keywords Used: "DummyJSON users endpoint pagination fetch mock users api post delete"
After reviewing the documentation, I thoroughly studied the functionality of the DummyJSON API users (`/users`) endpoint, which is used to asynchronously fetch realistic test data for the CRM system.

I analyzed how the `GET [https://dummyjson.com/users?limit=30](https://dummyjson.com/users?limit=30)` request works and the structure of the JSON object returned by the API (e.g., `firstName`, `lastName`, `email`, `phone`, `company.name`, and `image`).

I tested the specifics of the `POST /users/add` and `DELETE /users/{id}` methods and learned from the documentation that the DummyJSON server simulates these operations—it returns a successful response without modifying its central database.

Based on this technical finding, I made an architectural decision to store the initial data fetched from the API into `localStorage` (under the `crm_clients` key) and perform all subsequent CRUD operations directly within local storage.

Additionally, thanks to the documentation, I anticipated that attempting to delete a manually added client via `DELETE` would cause the server to return a 404 error. Therefore, I implemented logic in the code to ensure that even upon receiving a 404, the client is still safely removed from the local `localStorage` array.

Overall, utilizing this resource provided me with a comprehensive understanding of asynchronous `fetch()` communication with a server, HTTP request methods, and `try/catch` error handling.

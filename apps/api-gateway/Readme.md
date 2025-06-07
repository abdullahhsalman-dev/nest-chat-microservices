- In the API Gateway folder of a NestJS microservices architecture, the following components typically serve specific roles related to routing, authentication, and managing requests from clients to microservices.

1. Auth Folder:
   Purpose: The auth folder is responsible for handling authentication and authorization logic within the API Gateway. This typically includes managing user sessions, JWT tokens, and ensuring that only authorized requests are allowed to access specific microservices or resources.

Typical Files:

auth.service.ts: Handles the business logic for user authentication (e.g., validating credentials, generating tokens).

auth.controller.ts: Exposes the API endpoints for logging in, registering, or refreshing tokens.

jwt.strategy.ts: Contains the strategy for handling JWT tokens, typically using Passport.js with NestJS.

guards: Guards like JwtAuthGuard are used to protect routes that require authentication.

2. Chat Folder:
   Purpose: The chat folder deals with the chat-related operations within the API Gateway. It acts as the entry point for chat-related requests from clients and routes them to the appropriate microservice (like the Chat Service).

Typical Files:

chat.service.ts: Handles the logic related to chats such as creating a chat room, sending messages, or retrieving chat history.

chat.controller.ts: Exposes the API endpoints for managing chat activities like sending a message, joining a chat room, or getting the chat logs.

client-to-service communication: This might also include code for interacting with the underlying microservice (e.g., publishing messages to RabbitMQ or other message brokers).

3. Config Folder:
   Purpose: The config folder typically contains configuration-related files for the API Gateway. These might include environment-specific settings, configurations for connecting to external services, or even validation of incoming requests.

Typical Files:

app.config.ts: Contains global settings like base API URL, external service API keys, or default values.

rabbitmq.config.ts: Configuration related to RabbitMQ, including connection URLs, queue names, etc.

environment variables: Configuration files like env.ts for managing environment variables.

Validation: Might include some validation schema files to ensure that incoming requests have the required parameters.

4. Presence Folder:
   Purpose: The presence folder usually deals with user presence or real-time communication. This can track whether a user is online, whether they are in a particular chat room, or handling socket connections.

Typical Files:

presence.service.ts: Contains the logic to track and manage user presence (e.g., checking if a user is online or offline).

presence.controller.ts: Exposes the API endpoints related to user presence, such as checking the presence of a specific user or updating the status (online/offline).

socket management: If the system uses WebSockets (e.g., with Socket.IO or WebSockets), this folder might also manage connections, disconnections, and broadcasting presence status.

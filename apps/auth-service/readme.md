Key Points

Transport: Requests are sent over TCP, configured in the API Gateway’s ClientsModule.

Command Matching: The API Gateway sends commands (e.g., validate_token) that match @MessagePattern in the AuthController.

Data Flow: The API Gateway sends data (e.g., CreateUserDto, LoginUserDto, or token string) to the auth microservice,
which processes it and returns a response.

Examples of Triggers:

Registration/Login: The AuthController in the API Gateway (apps/api-gateway/src/auth/auth.controller.ts)
sends register or login commands when users hit /auth/register or /auth/login.
Token Validation: The JwtStrategy sends validate_token during JWT authentication.

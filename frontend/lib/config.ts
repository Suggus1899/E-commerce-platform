// Base URL of the nginx API gateway for the backend microservices, e.g.
// "http://localhost" in local dev. Never include a trailing slash or `/api`.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost";

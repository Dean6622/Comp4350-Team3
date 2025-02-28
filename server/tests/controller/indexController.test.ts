import request from "supertest";
import express from "express";
import {getIndex, postIndex} from "../../src/controller/indexController";

const app = express();
app.use(express.json());

app.get("/", getIndex);
app.post("/", postIndex);

describe("Index Controller", () => {
  test("GET / should return a test JSON response", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({test: "This is a test"});
  });

  test("POST / should return a test JSON response", async () => {
    const response = await request(app).post("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({test: "This is a test"});
  });

  // 3. GET request should have correct content-type
  test("GET / should return JSON content-type", async () => {
    const response = await request(app).get("/");
    expect(response.headers["content-type"]).toMatch(/json/);
  });

  // 4. POST request should have correct content-type
  test("POST / should return JSON content-type", async () => {
    const response = await request(app).post("/");
    expect(response.headers["content-type"]).toMatch(/json/);
  });

  // 5. GET request should not modify query parameters
  test("GET / should ignore query parameters", async () => {
    const response = await request(app).get("/?param=test");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({test: "This is a test"});
  });

  // 6. POST request should ignore body content
  test("POST / should return the same response regardless of body content", async () => {
    const response = await request(app)
      .post("/")
      .send({key: "value"});
    expect(response.status).toBe(200);
    expect(response.body).toEqual({test: "This is a test"});
  });

  // 7. Ensure GET request does not modify headers
  test("GET / should not alter request headers", async () => {
    const response = await request(app)
      .get("/")
      .set("Custom-Header", "TestValue");
    expect(response.status).toBe(200);
    expect(response.headers["custom-header"]).toBeUndefined();
  });

  // 8. Ensure POST request does not modify headers
  test("POST / should not alter request headers", async () => {
    const response = await request(app)
      .post("/")
      .set("Custom-Header", "TestValue");
    expect(response.status).toBe(200);
    expect(response.headers["custom-header"]).toBeUndefined();
  });

  // 9. GET request should return a 404 for unknown routes
  test("GET /unknown should return 404", async () => {
    const response = await request(app).get("/unknown");
    expect(response.status).toBe(404);
  });

  // 10. POST request should return a 404 for unknown routes
  test("POST /unknown should return 404", async () => {
    const response = await request(app).post("/unknown");
    expect(response.status).toBe(404);
  });
});

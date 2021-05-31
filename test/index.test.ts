import regrest, { Response } from "../src";

const expectResponseSnapshot = (received: Response, statusCode: number) => {
  expect(received.status).toBe(statusCode);
  expect(received.text).toMatchSnapshot();
  expect(received.json).toMatchSnapshot();
};

describe("regrest", () => {
  test("GET", async () => {
    const response = await regrest.get(
      "https://jsonplaceholder.typicode.com/posts/1"
    );

    expectResponseSnapshot(response, 200);
  });

  test("GET with params", async () => {
    const response = await regrest.get(
      "http://jsonplaceholder.typicode.com/comments",
      {
        params: { postId: 1 },
      }
    );

    expectResponseSnapshot(response, 200);
  });

  test("POST", async () => {
    const response = await regrest.post(
      "https://jsonplaceholder.typicode.com/posts",
      JSON.stringify({
        title: "foo",
        body: "bar",
        userId: 1,
      }),
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );

    expectResponseSnapshot(response, 201);
  });

  test("PUT", async () => {
    const response = await regrest.put(
      "https://jsonplaceholder.typicode.com/posts/1",
      JSON.stringify({
        id: 1,
        title: "foo",
        body: "bar",
        userId: 1,
      }),
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        maxRedirects: 10,
      }
    );

    expectResponseSnapshot(response, 200);
  });

  test("PATCH", async () => {
    const response = await regrest.patch(
      "https://jsonplaceholder.typicode.com/posts/1",
      JSON.stringify({
        title: "foo",
      }),
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );

    expectResponseSnapshot(response, 200);
  });

  test("DELETE", async () => {
    const response = await regrest.delete(
      "https://jsonplaceholder.typicode.com/posts/1"
    );

    expectResponseSnapshot(response, 200);
  });

  test("errors handling", async () => {
    try {
      await regrest.post("https://jsonplaceholder.typicode.com/rubbish");
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toMatchInlineSnapshot(`[NetworkError: 404 Not Found]`);
    }
  });
});

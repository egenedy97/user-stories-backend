import request from "supertest";
import { prisma } from "../../database";
import AuthRoute from "../../routes/auth.route";
import App from "../../app";

describe("Testing authRoute", () => {
  const testingApp = new App([new AuthRoute()]).app;
  const mockUserData: {
    email: string;
    name: string;
    username: string;
    password: string;
  } = {
    email: "johnd11oe32@auth.com",
    name: "John D2oe21",
    username: "jo12hnd1oe",
    password: "pas2sw1ord123", // You can use a fixed password for testing
  };

  //   });

  it("should register a user", async () => {
    const response = await request(testingApp)
      .post("/auth/signup")
      .set("Accept", "application/json")
      .send(mockUserData)
      .expect("Content-Type", /json/);

    // Assert the response
    expect(response.status).toBe(201); // Status should be OK
    expect(response.body.message).toBe("signup");
    expect(response.body.data.id).toBeGreaterThan(2);
    expect(response.body.data.email).toEqual(mockUserData.email);
    expect(response.body.data.email).toEqual(mockUserData.email);
    expect(response.body.data.password).toEqual(
      expect.stringMatching(/^\$2[ayb]\$.{56}$/)
    );
    await prisma.user.delete({
      where: {
        id: response.body.data.id,
      },
    });
  });

  //   it("should return a valid token and user data on successful login", async () => {
  //     // Mock user data and response
  //     const mockUser = { email: "johndoe@auth.com", password: "password123" };

  //     // Mock the login method in authService to return the mock response
  //     // mockAuthService.login.mockResolvedValue(mockLoginResponse);

  //     // Send a login request
  //     const response = await request(testingApp)
  //       .post("/auth/login")
  //       .send(mockUser)
  //       .expect("Content-Type", /json/);

  //     // Check that the response is as expected
  //     expect(response.status).toBe(200);
  //     expect(response.body).toEqual({
  //       data: {
  //         id: 1,
  //         email: "johndoe@auth.com",
  //         username: "johndoe",
  //         name: "John Doe",
  //       },
  //       token: "valid.jwt.token",
  //       message: "login",
  //     });
  //   });

  //   it("should return an error if login fails (invalid credentials)", async () => {
  //     const mockUser = { email: "wronguser@auth.com", password: "wrongpassword" };

  //     // Send a login request
  //     const response = await request(testingApp)
  //       .post("/auth/login")
  //       .send(mockUser)
  //       .expect("Content-Type", /json/);

  //     // Check that the response is an error (assuming 401 for unauthorized)
  //     expect(response.status).toBe(401);
  //     expect(response.body).toEqual({
  //       error: "Invalid credentials",
  //     });
  //   });

  //   it("should return an error if required fields are missing", async () => {
  //     const response = await request(testingApp)
  //       .post("/auth/login")
  //       .send({ email: "johndoe@auth.com" }) // Missing password
  //       .expect("Content-Type", /json/);

  //     // Check for a 400 Bad Request error due to missing fields
  //     expect(response.status).toBe(400);
  //     expect(response.body).toEqual({
  //       error: "Email and password are required",
  //     });
  //   });

  afterAll(() => {
    // Cleanup mocks
    jest.restoreAllMocks();
  });
});

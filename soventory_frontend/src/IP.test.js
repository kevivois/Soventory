import getIp from "./IP";

const originalUrl = process.env.REACT_APP_API_URL;

afterEach(() => {
    if (originalUrl === undefined) {
        delete process.env.REACT_APP_API_URL;
    } else {
        process.env.REACT_APP_API_URL = originalUrl;
    }
});

test("uses the current production API by default", () => {
    delete process.env.REACT_APP_API_URL;
    expect(getIp()).toBe("https://soventoryapi.vercel.app");
});

test("normalizes the configured API URL before appending routes", () => {
    process.env.REACT_APP_API_URL = "https://api.example.com///";
    expect(getIp() + "/user/login").toBe("https://api.example.com/user/login");
});

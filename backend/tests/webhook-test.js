const http = require("http");

// Sample GitHub pull request webhook payload
const samplePayload = {
  action: "opened",
  number: 1,
  pull_request: {
    id: 123456789,
    number: 1,
    title: "Add new feature",
    state: "open",
    user: {
      id: 987654321,
      login: "testuser",
      avatar_url: "https://github.com/images/error/testuser_happy.gif",
    },
    head: {
      sha: "abc123",
      ref: "feature-branch",
    },
    base: {
      sha: "def456",
      ref: "main",
    },
    diff_url: "https://github.com/test/repo/pull/1.diff",
    patch_url: "https://github.com/test/repo/pull/1.patch",
  },
  repository: {
    id: 111222333,
    name: "test-repo",
    full_name: "testuser/test-repo",
    owner: {
      id: 987654321,
      login: "testuser",
      avatar_url: "https://github.com/images/error/testuser_happy.gif",
    },
    private: false,
  },
  sender: {
    id: 987654321,
    login: "testuser",
    avatar_url: "https://github.com/images/error/testuser_happy.gif",
  },
};

// Test function
async function testWebhook() {
  const postData = JSON.stringify(samplePayload);

  const options = {
    hostname: "localhost",
    port: 3001,
    path: "/api/v1/webhooks/github",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "X-GitHub-Event": "pull_request",
      "X-GitHub-Delivery": "test-delivery-" + Date.now(),
      "User-Agent": "GitHub-Hookshot/test",
    },
  };

  return new Promise((resolve, reject) => {
    console.log(
      "Sending test webhook to:",
      `http://${options.hostname}:${options.port}${options.path}`
    );

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Response Status:", res.statusCode);
        console.log("Response Body:", data);

        if (res.statusCode === 200) {
          console.log("SUCCESS: Webhook test passed!");
          resolve(data);
        } else {
          console.log("FAILED: Webhook test failed");
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
console.log("Starting webhook test...");
console.log("Make sure your server is running on port 3001");
console.log("");

testWebhook()
  .then(() => {
    console.log("");
    console.log("Test completed successfully!");
    console.log("Check your server logs to see the webhook processing.");
  })
  .catch((error) => {
    console.error("Test failed:", error.message);
    process.exit(1);
  });

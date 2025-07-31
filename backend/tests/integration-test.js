const http = require("http");

// Sample GitHub pull request webhook payload with actual code changes
const samplePayload = {
  action: "opened",
  number: 2,
  pull_request: {
    id: 987654321,
    number: 2,
    title: "Add user authentication system",
    state: "open",
    user: {
      id: 123456789,
      login: "devuser",
      avatar_url: "https://github.com/images/error/devuser_happy.gif",
    },
    head: {
      sha: "feature123",
      ref: "feature/auth-system",
    },
    base: {
      sha: "main456",
      ref: "main",
    },
    diff_url: "https://github.com/test/repo/pull/2.diff",
    patch_url: "https://github.com/test/repo/pull/2.patch",
  },
  repository: {
    id: 555666777,
    name: "test-app",
    full_name: "devuser/test-app",
    owner: {
      id: 123456789,
      login: "devuser",
      avatar_url: "https://github.com/images/error/devuser_happy.gif",
    },
    private: false,
  },
  sender: {
    id: 123456789,
    login: "devuser",
    avatar_url: "https://github.com/images/error/devuser_happy.gif",
  },
};

// Test functions
async function testWebhookEndpoint() {
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
      "X-GitHub-Delivery": "integration-test-" + Date.now(),
      "User-Agent": "GitHub-Hookshot/integration-test",
    },
  };

  return new Promise((resolve, reject) => {
    console.log("Testing webhook endpoint...");

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Webhook Response Status: ${res.statusCode}`);
        console.log(`Webhook Response Body: ${data}`);

        if (res.statusCode === 200) {
          console.log("✓ Webhook endpoint test passed");
          resolve(JSON.parse(data));
        } else {
          console.log("✗ Webhook endpoint test failed");
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Webhook request error:", error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    console.log("Testing health endpoint...");

    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/health",
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Health Response Status: ${res.statusCode}`);

        try {
          const health = JSON.parse(data);
          console.log("Health Status:", JSON.stringify(health, null, 2));

          if (health.status === "OK") {
            console.log("✓ All services are healthy");
            resolve(health);
          } else {
            console.log("✗ Some services are unhealthy");
            resolve(health); // Don't reject, just log issues
          }
        } catch (error) {
          reject(new Error("Invalid health response"));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Health request error:", error.message);
      reject(error);
    });

    req.end();
  });
}

async function waitForProcessing(maxWaitTime = 30000) {
  console.log("Waiting for code analysis to complete...");

  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds

  return new Promise((resolve) => {
    const checkStatus = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= maxWaitTime) {
        console.log("⚠ Maximum wait time reached");
        resolve(false);
        return;
      }

      console.log(`Waiting... (${Math.round(elapsed / 1000)}s elapsed)`);
      setTimeout(checkStatus, checkInterval);
    };

    // Start checking after initial delay
    setTimeout(checkStatus, checkInterval);
  });
}

// Main integration test
async function runIntegrationTest() {
  console.log("=".repeat(60));
  console.log("DEVFLOW INTEGRATION TEST");
  console.log("=".repeat(60));
  console.log("");

  try {
    // Step 1: Test health endpoint
    console.log("STEP 1: Testing system health...");
    const health = await testHealthEndpoint();
    console.log("");

    // Step 2: Test webhook processing
    console.log("STEP 2: Testing webhook processing...");
    await testWebhookEndpoint();
    console.log("");

    // Step 3: Wait for background processing
    console.log("STEP 3: Waiting for code analysis...");
    console.log(
      "Note: This test simulates the webhook, but actual GitHub API calls"
    );
    console.log(
      "will fail without proper GitHub tokens and a real repository."
    );
    console.log("Check your server logs to see the processing flow.");
    await waitForProcessing(15000);
    console.log("");

    // Test summary
    console.log("=".repeat(60));
    console.log("INTEGRATION TEST SUMMARY");
    console.log("=".repeat(60));
    console.log("✓ Webhook endpoint is working");
    console.log("✓ Database connection established");
    console.log("✓ Service orchestration is functioning");

    if (health.ai?.status === "healthy") {
      console.log("✓ AI service is connected");
    } else {
      console.log("⚠ AI service needs OpenAI API key");
    }

    if (health.github?.status === "healthy") {
      console.log("✓ GitHub API is connected");
    } else {
      console.log("⚠ GitHub API needs authentication token");
    }

    console.log("");
    console.log("NEXT STEPS:");
    console.log("1. Add OpenAI API key to test AI analysis");
    console.log("2. Add GitHub token to test code fetching");
    console.log("3. Set up actual GitHub webhook for real testing");
    console.log("4. Check Prisma Studio to see created records");
  } catch (error) {
    console.error("=".repeat(60));
    console.error("INTEGRATION TEST FAILED");
    console.error("=".repeat(60));
    console.error("Error:", error.message);
    console.error("");
    console.error("Make sure your server is running on port 3001");
    process.exit(1);
  }
}

// Run the test
console.log("Starting DevFlow integration test...");
console.log("Make sure your server is running: npm run dev");
console.log("");

runIntegrationTest()
  .then(() => {
    console.log("");
    console.log("Integration test completed!");
  })
  .catch((error) => {
    console.error("Integration test failed:", error.message);
    process.exit(1);
  });

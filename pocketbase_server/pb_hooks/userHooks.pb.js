console.log("--- userHooks.pb.js loaded ---");
// pocketbase_server/pb_hooks/userHooks.pb.js

/**
 * Registers a custom API route to check if a user exists by email
 * and whether their email is verified.
 *
 * Endpoint: GET /api/custom/check-email-exists/:email
 */
console.log("--- [DEBUG] Attempting to add route: GET /api/custom/check-email-exists/:email ---");
routerAdd("GET", "/api/custom/check-email-exists/:email", (c) => {
    console.log("--- [DEBUG] Inside GET /api/custom/check-email-exists/:email handler ---");
    // Allow requests from any origin (for development)
    // c.Response().Header().Set("Access-Control-Allow-Origin", "*"); // Temporarily commented out, was c.res.setHeader then c.Response().Header().Set()
    console.log("--- [DEBUG] Access-Control-Allow-Origin header line currently skipped ---");

    console.log("--- [DEBUG] Attempting to get 'email' path parameter ---");
    const email = c.pathParam("email");
    console.log(`--- [DEBUG] 'email' path parameter: ${email} ---`);

    console.log("--- [DEBUG] Checking if email is empty ---");
    if (!email || email.trim() === "") {
        console.log("--- [DEBUG] Email is empty, returning 400 ---");
        return c.json(400, { error: "Email parameter is required and cannot be empty." });
    }
    console.log("--- [DEBUG] Email is not empty ---");

    let record;
    console.log("--- [DEBUG] Entering try block to find user by email ---");
    try {
        // Use $app.dao() for direct data access, bypassing API rules for this specific check.
        console.log(`--- [DEBUG] Calling $app.dao().findFirstRecordByData("users", "email", "${email.trim()}") ---`);
        record = $app.dao().findFirstRecordByData("users", "email", email.trim());
        console.log("--- [DEBUG] $app.dao().findFirstRecordByData call completed ---");
    } catch (err) {
        console.log("--- [DEBUG] Entered catch block for findFirstRecordByData ---");
        console.error("[Hook /api/custom/check-email-exists] Raw error object:", err);
        // findFirstRecordByData throws an error if not found or on other DB issues.
        if (err.toString().includes("no rows in result set") || err.status === 404) {
             console.log("--- [DEBUG] Error indicates user not found (no rows or 404), returning exists: false ---");
             return c.json(200, { exists: false });
        }
        console.error("[Hook /api/custom/check-email-exists] Error finding user by email (not 'no rows'):", err);
        console.log("--- [DEBUG] Returning 500 due to unexpected error in findFirstRecordByData ---");
        return c.json(500, { error: "Server error while checking email." });
    }
    
    console.log("--- [DEBUG] User record found (or try block succeeded without specific catch) ---");
    // If record is found
    return c.json(200, { exists: true, isVerified: record.verified() });

});
console.log("--- [DEBUG] routerAdd for GET /api/custom/check-email-exists/:email call completed ---");
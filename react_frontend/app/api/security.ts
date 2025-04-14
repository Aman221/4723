import bcrypt from 'bcryptjs';

interface User {
    id: string;
    username: string;
    passwordHash: string; // Store the hash, not the plain password
    email: string;
    createdAt: Date;
}

const SALT_ROUNDS = 10; //  Adjust for performance/security tradeoff

/**
 * Hashes a password using bcrypt.
 * @param password The plain-text password to hash.
 * @returns A promise that resolves to the bcrypt hash.
 */
async function hashPassword(password: string): Promise<string> {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Password hashing failed");
    }
}

/**
 * Verifies a password against a stored bcrypt hash.
 * @param password The plain-text password to verify.
 * @param hash The bcrypt hash to compare against.
 * @returns A promise that resolves to true if the password matches, false otherwise.
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error("Error verifying password:", error);
        return false; //  Important:  Return false on error to avoid accidentally authenticating
    }
}

/**
 * Creates a new user with a hashed password.
 * @param username The user's username.
 * @param password The user's plain-text password.
 * @param email The user's email address.
 * @returns A promise that resolves to the new user object (with the password hash).
 */
async function createUser(username: string, password: string, email: string): Promise<User> {
    try {
        const passwordHash = await hashPassword(password);
        const newUser: User = {
            id: crypto.randomUUID(), //  Use a UUID for the user ID
            username,
            passwordHash,
            email,
            createdAt: new Date(),
        };
        //  In a real application, you would save this newUser object to your database.
        console.log("New User Created:", newUser);
        return newUser;
    } catch (error: any) {
        throw new Error("User creation failed: " + error.message);
    }
}

import bcrypt from "bcrypt";

//handles password hashing for registration
export async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

//verifies password for login
export async function verifyPassword(hashedPassword, password) {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
}

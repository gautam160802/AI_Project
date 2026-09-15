const authCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
};

module.exports = { authCookieOptions };

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/auth.repository");

class AuthService {
  async registerShopkeeper(data) {
    const { phone, password, shopName, ownerName, address, city, email } = data;
    const existing = await authRepository.findUserByPhoneAndRole(
      phone,
      "SHOPKEEPER",
    );
    if (existing) {
      throw new Error("Shopkeeper with this phone already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser({
      phone,
      email,
      password: hashedPassword,
      role: "SHOPKEEPER",
    });

    await authRepository.createShopkeeper({
      user_id: user.id,
      shopName,
      ownerName,
      phone,
      email,
      address,
      city,
    });

    return user;
  }

  async registerAdmin(data) {
    const { phone, password, email } = data;
    const existing = await authRepository.findUserByPhoneAndRole(
      phone,
      "ADMIN",
    );
    if (existing) {
      throw new Error("Admin with this phone already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser({
      phone,
      email,
      password: hashedPassword,
      role: "ADMIN",
    });

    return user;
  }

  async login(phone, password, role) {
    const normalizedRole = (role || "").trim().toUpperCase();
    const user = await authRepository.findUserByPhoneAndRole(phone, normalizedRole);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Check if password is plain text (for migration)
      if (password === user.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await authRepository.updatePassword(user.id, hashedPassword);
        isMatch = true;
      }
    }

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await authRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }


  async refreshTokens(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret_xyz",
      );
      const user = await authRepository.findUserById(decoded.id);
      if (!user || user.refreshToken !== token) {
        throw new Error("Invalid refresh token");
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await authRepository.updateRefreshToken(user.id, refreshToken);
      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "jwt_secret_xyz",
      { expiresIn: "15m" },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET || "refresh_secret_xyz",
      { expiresIn: "7d" },
    );
  }
}

module.exports = new AuthService();

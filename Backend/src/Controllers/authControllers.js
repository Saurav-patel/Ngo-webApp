import User from "../Models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    const user = await User.create({
      username: name,
      email,
      password,
      role: "visitor",
    });

    const responseData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return res
      .status(201)
      .json(new ApiResponse(201, responseData, "User registered successfully"));
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      throw new ApiError(400, "Admin with this email already exists");
    }

    const admin = await User.create({
      username: name,
      email,
      password,
      role: "admin",
    });

    const responseData = {
      id: admin._id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
    };

    return res
      .status(201)
      .json(new ApiResponse(201, responseData, "Admin created successfully"));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Please provide email and password");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, responseData, "Login successful"));
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "User is missing, please login again");
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tokens refreshed successfully"));
  } catch (error) {
    next(error);
  }
};


const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
      }
    }

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};



const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "User is missing, please login again");
    }

    const currentUser = await User.findById(user._id).select("-password -__v");

    if (!currentUser) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, currentUser, "Current user fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

export {
  signUp,
  createAdmin,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
};

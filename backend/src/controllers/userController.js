import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search = '', role = '', page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      'Users retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, organization, assignedFacilities, phone, specialization } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return sendError(res, 'A user account with this email address already exists', 409);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Technician',
      organization: organization || 'AquaReliability Fisheries Ltd',
      assignedFacilities: assignedFacilities || ['South Bay Coastal Farm'],
      phone: phone || '',
      specialization: specialization || 'General Equipment Maintenance',
    });

    await logAuditEvent({
      req,
      action: 'CREATE_USER',
      entityName: 'User',
      entityId: user._id,
      newState: { email: user.email, role: user.role, name: user.name },
      details: `Created new user ${user.name} (${user.role})`,
    });

    return sendSuccess(res, { user: user.toJSON() }, 'User account successfully created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);

    const previousState = { role: user.role, name: user.name, assignedFacilities: user.assignedFacilities };
    const { name, role, organization, assignedFacilities, phone, specialization, isActive } = req.body;

    if (name) user.name = name;
    if (role) user.role = role;
    if (organization) user.organization = organization;
    if (assignedFacilities) user.assignedFacilities = assignedFacilities;
    if (phone !== undefined) user.phone = phone;
    if (specialization) user.specialization = specialization;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    await logAuditEvent({
      req,
      action: 'UPDATE_USER',
      entityName: 'User',
      entityId: user._id,
      previousState,
      newState: { role: user.role, name: user.name, assignedFacilities: user.assignedFacilities },
      details: `Updated user profile for ${user.email}`,
    });

    return sendSuccess(res, { user: user.toJSON() }, 'User account updated');
  } catch (err) {
    next(err);
  }
};

export const patchUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);

    user.isActive = isActive;
    await user.save();

    await logAuditEvent({
      req,
      action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entityName: 'User',
      entityId: user._id,
      details: `${isActive ? 'Activated' : 'Deactivated'} account for ${user.email}`,
    });

    return sendSuccess(res, { user: user.toJSON() }, `User successfully ${isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};

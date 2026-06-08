import PropTypes from "prop-types";

/**
 * @param {Object} props - Component props
 * @param {Array<{id: string, name: string}>} props.role - Array of user role objects
 * @param {string[]} props.allowedRoles - Array of allowed role names
 * @returns {boolean}
 */
export default function RoleChecker({ role, allowedRoles }) {
  return role.some((userRole) => allowedRoles.includes(userRole.name));
}

RoleChecker.propTypes = {
  role: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

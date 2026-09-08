import { describe, it, expect } from "vitest";
import { GlobalRole } from "@prisma/client";

function hasRolePermission(userRole: GlobalRole, allowedRoles: GlobalRole[]): boolean {
  return allowedRoles.includes(userRole);
}

describe("Role-Based Access Control (RBAC)", () => {
  it("should allow WORKER access only to worker-authorized resources", () => {
    const workerRole = GlobalRole.WORKER;
    const workerAllowed = [GlobalRole.WORKER, GlobalRole.TALENT];
    const adminOnly = [GlobalRole.ADMIN];
    const clientOnly = [GlobalRole.CLIENT];

    expect(hasRolePermission(workerRole, workerAllowed)).toBe(true);
    expect(hasRolePermission(workerRole, adminOnly)).toBe(false);
    expect(hasRolePermission(workerRole, clientOnly)).toBe(false);
  });

  it("should allow CLIENT access only to client-authorized resources", () => {
    const clientRole = GlobalRole.CLIENT;
    const clientAllowed = [GlobalRole.CLIENT];
    const adminOnly = [GlobalRole.ADMIN];

    expect(hasRolePermission(clientRole, clientAllowed)).toBe(true);
    expect(hasRolePermission(clientRole, adminOnly)).toBe(false);
  });

  it("should allow ADMIN to access admin resources", () => {
    const adminRole = GlobalRole.ADMIN;
    const adminAllowed = [GlobalRole.ADMIN];

    expect(hasRolePermission(adminRole, adminAllowed)).toBe(true);
  });
});

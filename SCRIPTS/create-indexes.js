// scripts/create-indexes.js
// Projeto: OpSafe
// Alvo: database "opsafe_dev"

const dbName = "opsafe_dev";
const dbOpsafe = db.getSiblingDB(dbName);

print(`Using database: ${dbName}`);

// =============== organizations ===============
dbOpsafe.organizations.createIndex(
  { status: 1 },
  { name: "idx_organizations_status" }
);
dbOpsafe.organizations.createIndex(
  { name: 1 },
  { name: "idx_organizations_name" }
);
dbOpsafe.organizations.createIndex(
  { isDeleted: 1, createdAt: -1 },
  { name: "idx_organizations_isDeleted_createdAt" }
);

// =============== users ===============
dbOpsafe.users.createIndex(
  { organizationId: 1, email: 1 },
  { name: "uq_users_org_email", unique: true }
);
dbOpsafe.users.createIndex(
  { organizationId: 1, status: 1 },
  { name: "idx_users_org_status" }
);
dbOpsafe.users.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_users_org_isDeleted" }
);

// =============== operators ===============
dbOpsafe.operators.createIndex(
  { organizationId: 1, status: 1 },
  { name: "idx_operators_org_status" }
);
dbOpsafe.operators.createIndex(
  { organizationId: 1, identifierCode: 1 },
  { name: "idx_operators_org_identifierCode" }
);
dbOpsafe.operators.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_operators_org_isDeleted" }
);

// =============== clients ===============
dbOpsafe.clients.createIndex(
  { organizationId: 1, name: 1 },
  { name: "idx_clients_org_name" }
);
dbOpsafe.clients.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_clients_org_isDeleted" }
);

// =============== contracts ===============
dbOpsafe.contracts.createIndex(
  { organizationId: 1, clientId: 1, status: 1 },
  { name: "idx_contracts_org_client_status" }
);
dbOpsafe.contracts.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_contracts_org_isDeleted" }
);

// =============== posts ===============
dbOpsafe.posts.createIndex(
  { organizationId: 1, clientId: 1, status: 1 },
  { name: "idx_posts_org_client_status" }
);
dbOpsafe.posts.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_posts_org_isDeleted" }
);

// =============== equipmentTypes ===============
dbOpsafe.equipmentTypes.createIndex(
  { organizationId: 1, category: 1 },
  { name: "idx_equipmentTypes_org_category" }
);
dbOpsafe.equipmentTypes.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_equipmentTypes_org_isDeleted" }
);

// =============== equipments ===============
dbOpsafe.equipments.createIndex(
  { organizationId: 1, status: 1 },
  { name: "idx_equipments_org_status" }
);
dbOpsafe.equipments.createIndex(
  { organizationId: 1, equipmentTypeId: 1, status: 1 },
  { name: "idx_equipments_org_type_status" }
);
dbOpsafe.equipments.createIndex(
  { organizationId: 1, assetTag: 1 },
  { name: "uq_equipments_org_assetTag", unique: true }
);
dbOpsafe.equipments.createIndex(
  { organizationId: 1, validUntil: 1, status: 1 },
  { name: "idx_equipments_org_validUntil_status" }
);
dbOpsafe.equipments.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_equipments_org_isDeleted" }
);

// =============== assignments ===============
dbOpsafe.assignments.createIndex(
  { organizationId: 1, equipmentId: 1, createdAt: -1 },
  { name: "idx_assignments_org_equipment_createdAt" }
);
dbOpsafe.assignments.createIndex(
  { organizationId: 1, operatorId: 1, createdAt: -1 },
  { name: "idx_assignments_org_operator_createdAt" }
);
dbOpsafe.assignments.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_assignments_org_isDeleted" }
);

// =============== terms ===============
dbOpsafe.terms.createIndex(
  { organizationId: 1, operatorId: 1, signedAt: -1 },
  { name: "idx_terms_org_operator_signedAt" }
);
dbOpsafe.terms.createIndex(
  { organizationId: 1, createdAt: -1 },
  { name: "idx_terms_org_createdAt" }
);
dbOpsafe.terms.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_terms_org_isDeleted" }
);

// =============== maintenanceOrders ===============
dbOpsafe.maintenanceOrders.createIndex(
  { organizationId: 1, equipmentId: 1, status: 1 },
  { name: "idx_maintenance_org_equipment_status" }
);
dbOpsafe.maintenanceOrders.createIndex(
  { organizationId: 1, status: 1, openedAt: -1 },
  { name: "idx_maintenance_org_status_openedAt" }
);
dbOpsafe.maintenanceOrders.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_maintenance_org_isDeleted" }
);

// =============== alerts ===============
dbOpsafe.alerts.createIndex(
  { organizationId: 1, type: 1, severity: 1, createdAt: -1 },
  { name: "idx_alerts_org_type_severity_createdAt" }
);
dbOpsafe.alerts.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_alerts_org_isDeleted" }
);

// =============== auditLogs ===============
dbOpsafe.auditLogs.createIndex(
  { organizationId: 1, entityType: 1, entityId: 1, createdAt: -1 },
  { name: "idx_auditLogs_org_entity_createdAt" }
);
dbOpsafe.auditLogs.createIndex(
  { organizationId: 1, createdAt: -1 },
  { name: "idx_auditLogs_org_createdAt" }
);

// =============== customFields ===============
dbOpsafe.customFields.createIndex(
  { organizationId: 1, targetCollection: 1 },
  { name: "idx_customFields_org_targetCollection" }
);
dbOpsafe.customFields.createIndex(
  { organizationId: 1, targetCollection: 1, fieldKey: 1 },
  { name: "uq_customFields_org_target_fieldKey", unique: true }
);
dbOpsafe.customFields.createIndex(
  { organizationId: 1, isDeleted: 1 },
  { name: "idx_customFields_org_isDeleted" }
);

print("Indexes created successfully for opsafe_dev.");

export type ID = string;

export type Category = {
  category_id: ID;
  organization_id: ID;
  name: string;
};

export type ModifierGroup = {
  modifier_group_id: ID;
  organization_id: ID;
  name: string;
};

export type Modifier = {
  modifier_id: ID;
  modifier_group_id: ID;
  name: string;
};

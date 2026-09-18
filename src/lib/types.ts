export interface PublicMember {
  id: string;
  name: string;
  region: string;
  level: number;
  circle: number;
  sigil: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedMemberResult {
  id: string;
  passphrase: string;
}
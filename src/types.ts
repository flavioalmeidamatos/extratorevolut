export type TransactionType = 'OPENING' | 'FEE' | 'MOA' | 'MOS' | 'MOR' | 'EXO' | 'EXI' | 'CAR' | 'ATM';

export interface StatementTransaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  incoming: number;
  outgoing: number;
  balance: number;
}

export interface AccountField {
  label: string;
  value: string;
}

export interface AccountSection {
  title?: string;
  fields: AccountField[];
}

export interface CompanyProfile {
  name: string;
  address: string[];
}

export interface StatementData {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  initialBalance: number;
  company: CompanyProfile;
  accountSections: AccountSection[];
  transactions: StatementTransaction[];
}

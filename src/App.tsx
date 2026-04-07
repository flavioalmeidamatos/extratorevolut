import { Fragment, type ReactNode } from 'react';
import { Printer } from 'lucide-react';
import { statementData } from './statementData';
import { StatementTransaction, TransactionType } from './types';

const SHORT_MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const LONG_MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DESCRIPTION_WRAP_LENGTH = 'Taxa da Revolut Business • Taxa do plano'.length;
const FIRST_PAGE_TRANSACTION_LIMIT = 7;
const CONTINUATION_PAGE_TRANSACTION_LIMIT = 14;
const DISPLAYED_TYPE_ORDER: TransactionType[] = ['CAR', 'MOS', 'MOR', 'MOA', 'ATM', 'EXO', 'EXI', 'FEE'];
const FOOTER_LEGAL_LINES = [
  'O Revolut Bank UAB é uma instituição de crédito licenciada na República da Lituânia, com o número de registro comercial 304580906 e código de autorização LB002119. Sua sede está',
  'localizada na Konstitucijos ave. 21B, LT-08130 Vilnius, República da Lituânia. Somos licenciados e regulamentados pelo Banco da Lituânia e pelo Banco Central Europeu.',
  'Se tiver alguma dúvida, entre em contato conosco pelo chat do app da Revolut. Os depósitos elegíveis são segurados pelo Sistema de seguro de depósito da Lituânia. Informações sobre o seguro de',
  'depósito da instituição pública "Seguro de depósito e investimento" (Viešoji įstaiga "Indėlių ir investicijų draudimas") estão disponíveis no Documento de informações sobre seguro de',
];

const TYPE_LABELS: Record<TransactionType, string> = {
  OPENING: 'Abertura',
  FEE: 'Taxas da Revolut (FEE)',
  MOA: 'Depósito (MOA)',
  MOS: 'Dinheiro enviado (MOS)',
  MOR: 'Dinheiro recebido (MOR)',
  EXO: 'Câmbio realizado (EXO)',
  EXI: 'Câmbio em (EXI)',
  CAR: 'Pagamentos com cartão (CAR)',
  ATM: 'Saques em caixa eletrônico (ATM)',
};

const validation = validateTransactions(statementData.transactions, statementData.initialBalance);
const summary = calculateSummary(statementData.transactions, statementData.initialBalance);
const typeSummary = calculateTypeSummary(statementData.transactions);
const orderedTransactions = [...statementData.transactions].sort(
  (left, right) => parseStatementDate(right.date).getTime() - parseStatementDate(left.date).getTime(),
);
const transactionChunks = paginateTransactions(orderedTransactions);

export default function App() {
  const pageCount = transactionChunks.length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e4ebf8_0%,#f6f7fb_38%,#eef2f7_100%)] px-4 py-4 font-sans text-[#191c1f] sm:px-6 sm:py-6 print:bg-white print:p-0">
      <section className="mx-auto mb-4 flex w-full max-w-[920px] flex-col gap-3 print:hidden">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Extrato simulado</p>
              <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">Preview fiel do extrato com dados recalculados</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Todos os campos derivados foram revisados com base na massa enviada: entradas, saídas, saldo final, totais por tipo e consistência do saldo linha a linha.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Printer size={18} />
              Imprimir / Salvar PDF
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile label="Saldo inicial" value={formatCurrency(summary.initialBalance)} />
            <SummaryTile label="Entradas" value={formatCurrency(summary.totalIncomes)} />
            <SummaryTile label="Saídas" value={formatCurrency(-summary.totalExpenses)} />
            <SummaryTile label="Saldo final" value={formatCurrency(summary.finalBalance)} />
          </div>

          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${validation.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}
            data-validation-status={validation.ok ? 'ok' : 'error'}
          >
            {validation.ok
              ? `Validação concluída: ${statementData.transactions.length} lançamentos conferidos e todos os saldos batem com a movimentação informada.`
              : `Foram encontrados problemas na conciliação: ${validation.errors.join(' | ')}`}
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[920px] flex-col gap-4 print:max-w-none print:gap-0" data-statement-ready="true">
        {transactionChunks.map((chunk, index) => {
          const pageNumber = index + 1;
          const isFirstPage = index === 0;
          const isLastPage = index === transactionChunks.length - 1;

          return (
            <Fragment key={`page-${pageNumber}`}>
              <StatementPage pageNumber={pageNumber} pageCount={pageCount}>
                {isFirstPage ? (
                  <>
                    <StatementHeader />
                    <AccountOverview />
                    <BalanceSummary />
                    <TransactionsSection
                      title={`Transações de ${formatLongDate(statementData.periodStart)} a ${formatLongDate(statementData.periodEnd)}`}
                      transactions={chunk}
                    />
                  </>
                ) : (
                  <TransactionsSection title="Continuação das transações" transactions={chunk} compact />
                )}

                {isLastPage ? <TypeSummarySection /> : null}
              </StatementPage>
            </Fragment>
          );
        })}
      </section>
    </main>
  );
}

function StatementPage({
  children,
  pageNumber,
  pageCount,
}: {
  children?: ReactNode;
  pageNumber: number;
  pageCount: number;
}) {
  return (
    <article className="relative mx-auto flex min-h-[1120px] w-full flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] print:h-[297mm] print:min-h-[297mm] print:w-[210mm] print:rounded-none print:shadow-none">
      <div className="flex flex-1 flex-col px-5 py-5 sm:px-8 sm:py-8 print:h-full print:px-[14mm] print:pb-[24mm] print:pt-[14mm]">
        <div className="flex flex-1 flex-col print:mx-auto print:w-[182mm]">
          {children}
        </div>
        <PageFooter pageNumber={pageNumber} pageCount={pageCount} />
      </div>
    </article>
  );
}

function StatementHeader() {
  return (
    <header className="flex flex-col gap-6 pb-6 sm:flex-row sm:items-start sm:justify-between print:pb-[12.2mm]">
      <img src="/revolut-business-logo-original.png" alt="Revolut Business" className="h-[20px] w-auto print:h-[19.5px]" />

      <div className="text-left sm:text-right print:pt-[0.4mm]">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#191c1f] print:text-[21pt] print:leading-none">Extrato da conta</h2>
        <p className="mt-1 text-sm font-normal text-[#191c1f] print:text-[6pt]">Gerado em {formatLongDate(statementData.generatedAt)}</p>
      </div>
    </header>
  );
}

function AccountOverview() {
  return (
    <section className="grid gap-8 py-8 md:grid-cols-[1.05fr_0.95fr] print:gap-[15mm] print:py-[7.2mm]">
      <div className="print:-mt-[4.2mm]">
        <h3 className="text-lg font-bold uppercase tracking-tight text-[#191c1f] print:text-[12pt] print:leading-none">{statementData.company.name}</h3>
        <div className="mt-3 space-y-1 text-sm font-normal leading-5 text-[#191c1f] print:mt-[2.3mm] print:space-y-[0.2mm] print:text-[7pt] print:leading-[1.15]">
          {statementData.company.address.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <div className="grid gap-5 text-sm print:mt-[6.2mm] print:gap-[4.9mm] print:text-[7.5pt]">
        {statementData.accountSections.map((section, index) => (
          <div key={section.title ?? section.fields[0].label} className={`grid gap-2 print:gap-[0mm] ${index > 0 ? 'print:pt-[0.1mm]' : ''}`}>
            <dl className="grid grid-cols-[136px_1fr] gap-x-4 gap-y-1 print:grid-cols-[39mm_1fr] print:gap-x-[4mm] print:gap-y-[0.9mm]">
              {section.fields.map((field) => (
                <div key={field.label} className="contents">
                  <dt className="font-bold text-[#191c1f]">{field.label}</dt>
                  <dd className="font-normal text-[#191c1f]">{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function BalanceSummary() {
  return (
    <section className="pb-8 print:pb-[10mm]">
      <h3 className="text-xl font-medium tracking-tight text-[#191c1f] print:mb-[4mm] print:text-[11.25pt]">Resumo do saldo</h3>

      <div className="mt-4 max-w-[410px] print:mt-[0.2mm] print:max-w-[71mm]">
        <SummaryRow label="Saldo inicial" value={formatCurrency(summary.initialBalance)} />
        <SummaryRow label="Entradas" value={formatCurrency(summary.totalIncomes)} />
        <SummaryRow label="Saídas" value={formatCurrency(-summary.totalExpenses)} />
        <SummaryRow label="Saldo de fechamento" value={formatCurrency(summary.finalBalance)} isLast />
      </div>

      <p className="mt-4 text-xs text-[#191c1f] print:mt-[3.2mm] print:text-[6pt]">
        Seus fundos são mantidos e protegidos por um banco licenciado.
      </p>
    </section>
  );
}

function TransactionsSection({
  title,
  transactions,
  compact = false,
}: {
  title: string;
  transactions: StatementTransaction[];
  compact?: boolean;
}) {
  return (
    <section className={`${compact ? 'pt-2' : 'pt-4'} print:pt-0`}>
      <h3 className="font-display text-xl font-semibold tracking-tight text-[#191c1f] print:text-[12pt]">{title}</h3>

      <div className="mt-4 grid gap-3 md:hidden print:hidden">
        {transactions.map((transaction) => (
          <article key={transaction.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#191c1f]">{getTransactionCode(transaction)}</p>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {wrapDescription(transaction.description).map((line, index) => (
                    <p key={`${transaction.id}-mobile-line-${index}`}>{line}</p>
                  ))}
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500">{formatShortDate(transaction.date)}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <FieldStack label="Tipo" value={getTransactionCode(transaction)} />
              <FieldStack label="Saídas" value={transaction.outgoing ? formatAmount(transaction.outgoing) : '-'} />
              <FieldStack label="Entradas" value={transaction.incoming ? formatAmount(transaction.incoming) : '-'} />
              <FieldStack label="Saldo" value={formatAmount(transaction.balance)} />
            </div>
          </article>
        ))}
      </div>

      <table className="mt-4 hidden w-full border-collapse text-left md:table print:mt-[3.3mm] print:table">
        <thead>
          <tr className="border-b-2 border-[#191c1f] print:border-b-[1.5pt]">
            <th className="py-3 pr-3 font-display text-[13px] font-semibold text-[#191c1f] print:w-[28mm] print:py-[2.2mm] print:text-[8.25pt]">Data (UTC)</th>
            <th className="py-3 pr-3 font-display text-[13px] font-semibold text-[#191c1f] print:w-[16mm] print:py-[2.2mm] print:text-[8.25pt]"></th>
            <th className="py-3 pr-3 font-display text-[13px] font-semibold text-[#191c1f] print:py-[2.2mm] print:text-[8.25pt]">Descrição</th>
            <th className="py-3 pr-3 text-right font-display text-[13px] font-semibold text-[#191c1f] print:w-[20mm] print:py-[2.2mm] print:text-[8.25pt]">Saídas</th>
            <th className="py-3 pr-3 text-right font-display text-[13px] font-semibold text-[#191c1f] print:w-[22mm] print:py-[2.2mm] print:text-[8.25pt]">Entradas</th>
            <th className="py-3 text-right font-display text-[13px] font-semibold text-[#191c1f] print:w-[22mm] print:py-[2.2mm] print:text-[8.25pt]">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-[#191c1f] border-opacity-100 align-top print:border-b-[0.75pt]">
              <td className="py-3 pr-3 text-[13px] font-normal text-[#191c1f] print:py-[2.15mm] print:text-[7.5pt]">{formatShortDate(transaction.date)}</td>
              <td className="py-3 pr-3 align-top text-[13px] font-medium uppercase tracking-[0.08em] text-[#191c1f] print:py-[2.15mm] print:text-[7.5pt] print:tracking-normal">
                {getTransactionCode(transaction)}
              </td>
              <td className="py-3 pr-3 text-[13px] font-normal text-[#191c1f] print:py-[2.15mm] print:text-[7.5pt]">
                <div className="leading-5 print:leading-[1.32]">
                  {wrapDescription(transaction.description).map((line, index) => (
                    <p key={`${transaction.id}-table-line-${index}`}>{line}</p>
                  ))}
                </div>
              </td>
              <td className="py-3 pr-3 text-right text-[13px] font-normal text-[#191c1f] print:py-[2.15mm] print:text-[7.5pt]">
                {transaction.outgoing ? formatAmount(transaction.outgoing) : ''}
              </td>
              <td className="py-3 pr-3 text-right text-[13px] font-normal text-[#191c1f] print:py-[2.15mm] print:text-[7.5pt]">
                {transaction.incoming ? formatAmount(transaction.incoming) : ''}
              </td>
              <td className="py-3 text-right text-[13px] font-normal text-[#191c1f] print:py-[2.15mm] print:text-[7.5pt]">{formatAmount(transaction.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TypeSummarySection() {
  return (
    <section className="pt-8 print:pt-[9mm]">
      <h3 className="text-xl font-medium tracking-tight text-[#191c1f] print:mb-[4.5mm] print:text-[11.25pt]">Tipos de transação</h3>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 print:mt-0 print:gap-x-[12mm] print:gap-y-[8.4mm]">
        {DISPLAYED_TYPE_ORDER.map((type) => {
          const value = typeSummary[type] ?? 0;

          return (
            <div key={type} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 print:rounded-none print:border-none print:bg-transparent print:p-0">
              <p className="text-sm leading-5 text-[#191c1f] print:text-[7.5pt] print:leading-[1.2]">{TYPE_LABELS[type]}</p>
              <p className="mt-1 text-sm font-normal text-[#191c1f] print:text-[7.5pt]">{formatSignedCurrency(value)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PageFooter({ pageNumber, pageCount }: { pageNumber: number; pageCount: number }) {
  return (
    <footer className="mt-auto pt-5 text-[10px] text-[#191c1f] print:absolute print:bottom-0 print:left-0 print:right-0 print:mt-0 print:px-0 print:pt-0">
      <div className="print:hidden">
        <div className="grid gap-4 md:grid-cols-[190px_1fr]">
          <div className="flex gap-3">
            <img src="/revolut-help-qr.png" alt="QR code de ajuda" className="h-14 w-14 rounded bg-white object-cover" />
            <div>
              <p>Relatar perda ou roubo de cartão</p>
              <p className="text-[11px]">+370 5 214 3608</p>
              <p className="mt-2">Obtenha ajuda diretamente no aplicativo</p>
              <p className="text-[11px]">Como ler o código QR</p>
            </div>
          </div>

          <div className="text-[11px] leading-[1.35]">
            {FOOTER_LEGAL_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              depósito e em seu site oficial{' '}
              <a href="https://www.iidraudimas.lt" className="text-[#0000ff] underline">
                www.iidraudimas.lt
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <span>© 2026 Revolut Bank UAB</span>
          <span>{pageNumber}/{pageCount}</span>
        </div>
      </div>

      <div className="mx-auto hidden print:block" style={{ position: 'relative', width: '210mm', height: '19.93mm' }}>
        <img
          src={pageNumber === 1 ? '/revolut-footer-original-page-1.png' : '/revolut-footer-original-page-2.png'}
          alt={`Rodapé original da página ${pageNumber}`}
          style={{ position: 'absolute', left: 0, bottom: 0, width: '210mm', height: '19.93mm', display: 'block', imageRendering: 'auto' }}
        />
      </div>
    </footer>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 text-sm text-[#191c1f] print:py-[2.4mm] print:text-[7.5pt] print:leading-none ${isLast ? '' : 'border-b border-[#191c1f]'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function FieldStack({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}

function paginateTransactions(transactions: StatementTransaction[]) {
  const chunks: StatementTransaction[][] = [];
  chunks.push(transactions.slice(0, FIRST_PAGE_TRANSACTION_LIMIT));

  let cursor = FIRST_PAGE_TRANSACTION_LIMIT;
  while (cursor < transactions.length) {
    chunks.push(transactions.slice(cursor, cursor + CONTINUATION_PAGE_TRANSACTION_LIMIT));
    cursor += CONTINUATION_PAGE_TRANSACTION_LIMIT;
  }

  return chunks;
}

function calculateSummary(transactions: StatementTransaction[], initialBalance: number) {
  const totalIncomes = roundCurrency(transactions.reduce((accumulator, transaction) => accumulator + transaction.incoming, 0));
  const totalExpenses = roundCurrency(transactions.reduce((accumulator, transaction) => accumulator + transaction.outgoing, 0));
  const finalBalance = transactions.length ? transactions[transactions.length - 1].balance : initialBalance;

  return {
    initialBalance,
    totalIncomes,
    totalExpenses,
    finalBalance,
  };
}

function calculateTypeSummary(transactions: StatementTransaction[]) {
  const grouped: Partial<Record<TransactionType, number>> = {};

  for (const transaction of transactions) {
    const summaryType = transaction.type === 'OPENING' ? 'MOA' : transaction.type;
    grouped[summaryType] = roundCurrency((grouped[summaryType] ?? 0) + transaction.incoming - transaction.outgoing);
  }

  return grouped;
}

function validateTransactions(transactions: StatementTransaction[], initialBalance: number) {
  const errors: string[] = [];
  let runningBalance = initialBalance;

  for (const transaction of transactions) {
    runningBalance = roundCurrency(runningBalance + transaction.incoming - transaction.outgoing);

    if (roundCurrency(transaction.balance) !== runningBalance) {
      errors.push(`${formatShortDate(transaction.date)} deveria fechar em ${formatAmount(runningBalance)} e veio ${formatAmount(transaction.balance)}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function formatCurrency(value: number) {
  const normalized = roundCurrency(value);
  const absoluteValue = Math.abs(normalized);
  const prefix = normalized < 0 ? '- ' : '';

  return `${prefix}€${new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absoluteValue)}`;
}

function formatSignedCurrency(value: number) {
  if (value > 0) return `+ ${formatCurrency(value)}`;
  if (value < 0) {
    return `- €${new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value))}`;
  }
  return formatCurrency(0);
}

function formatAmount(value: number) {
  return `€${new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundCurrency(value))}`;
}

function formatShortDate(value: string) {
  const date = parseStatementDate(value);
  return `${date.getUTCDate()} ${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatLongDate(value: string) {
  const date = parseStatementDate(value);
  return `${date.getUTCDate()} de ${LONG_MONTHS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

function parseStatementDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function getTransactionCode(transaction: StatementTransaction) {
  return transaction.type === 'OPENING' ? 'MOA' : transaction.type;
}

function wrapDescription(text: string) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= DESCRIPTION_WRAP_LENGTH) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
      continue;
    }

    lines.push(word.slice(0, DESCRIPTION_WRAP_LENGTH));
    currentLine = word.slice(DESCRIPTION_WRAP_LENGTH);
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

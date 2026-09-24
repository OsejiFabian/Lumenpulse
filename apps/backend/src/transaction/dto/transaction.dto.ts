import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/pagination';

export enum TransactionType {
  PAYMENT = 'payment',
  SWAP = 'swap',
  TRUSTLINE = 'trustline',
  CREATE_ACCOUNT = 'create_account',
  ACCOUNT_MERGE = 'account_merge',
  INFLATION = 'inflation',
}

export enum TransactionStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}

export class TransactionDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  assetCode: string;

  @ApiProperty()
  assetIssuer: string | null;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  date: string;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty()
  transactionHash: string;

  @ApiProperty({ required: false })
  memo?: string;

  @ApiProperty({ required: false })
  fee?: string;

  @ApiProperty({ description: 'Human-readable description of the transaction' })
  description: string;
}

export class TransactionHistoryResponseDto {
  @ApiProperty({ type: [TransactionDto] })
  transactions: TransactionDto[];

  @ApiProperty({ description: 'Number of transactions in this page' })
  total: number;

  @ApiProperty({ required: false })
  nextPage?: string;

  @ApiProperty({
    description: 'Standard pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

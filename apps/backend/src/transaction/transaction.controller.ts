import { Controller, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { UsersService } from '../users/users.service';
import { TransactionHistoryResponseDto } from './dto/transaction.dto';
import {
  PaginationQueryDto,
  createCursorMeta,
  DEFAULT_PAGE_SIZE,
} from '../common/pagination';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email?: string;
  };
}

interface StellarAccountWithPrimary {
  id: string;
  publicKey: string;
  label?: string;
  isPrimary?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly usersService: UsersService,
  ) {}

  @Get('history')
  @ApiOperation({
    summary: 'Get transaction history for current user',
    description:
      'Returns a cursor-paginated page of transaction history. Supports the standard pagination parameters (page, limit, cursor) and returns standard pagination metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns transaction history',
    type: TransactionHistoryResponseDto,
  })
  async getTransactionHistory(
    @Req() req: RequestWithUser,
    @Query() query: PaginationQueryDto,
  ): Promise<TransactionHistoryResponseDto> {
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;
    const accounts = await this.usersService.getStellarAccounts(req.user.id);
    const typedAccounts = accounts as StellarAccountWithPrimary[];

    const primaryAccount =
      typedAccounts.find((a) => a.isPrimary === true) || typedAccounts[0];

    if (!primaryAccount) {
      return {
        transactions: [],
        total: 0,
        meta: createCursorMeta({ limit }),
      };
    }

    const { transactions, nextPage } =
      await this.transactionService.getTransactionHistory(
        primaryAccount.publicKey,
        limit,
        query.cursor,
      );

    return {
      transactions,
      total: transactions.length,
      nextPage,
      meta: createCursorMeta({ limit, nextCursor: nextPage }),
    };
  }

  @Get('account/:publicKey')
  @ApiOperation({
    summary: 'Get transaction history for a specific public key',
    description:
      'Returns a cursor-paginated page of transaction history for the given account. Supports the standard pagination parameters (page, limit, cursor) and returns standard pagination metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns transaction history for the specified account',
    type: TransactionHistoryResponseDto,
  })
  async getTransactionHistoryForAccount(
    @Param('publicKey') publicKey: string,
    @Query() query: PaginationQueryDto,
  ): Promise<TransactionHistoryResponseDto> {
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;
    const { transactions, nextPage } =
      await this.transactionService.getTransactionHistory(
        publicKey,
        limit,
        query.cursor,
      );

    return {
      transactions,
      total: transactions.length,
      nextPage,
      meta: createCursorMeta({ limit, nextCursor: nextPage }),
    };
  }
}

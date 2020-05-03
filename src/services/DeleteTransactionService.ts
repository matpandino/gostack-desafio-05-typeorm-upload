import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);

    if (transaction) {
      await transactionsRepository.delete(id);
    }
    if (!transaction) {
      throw new AppError('Transaction does not exist.', 400);
    }
  }
}

export default DeleteTransactionService;

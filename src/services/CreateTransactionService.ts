import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    const balance = await transactionsRepository.getBalance();

    let categoryResponse;

    const categoryExists = await categoriesRepository.findOne({
      title: category,
    });

    if (categoryExists) {
      categoryResponse = categoryExists;
    }

    if (!categoryExists) {
      categoryResponse = await categoriesRepository.create({ title: category });
      await categoriesRepository.save(categoryResponse);
    }

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Outcome exceeds the total balance.', 400);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryResponse?.id,
      category: categoryResponse,
    });

    if (!transaction) {
      throw new AppError('Transaction could not be created', 400);
    }

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

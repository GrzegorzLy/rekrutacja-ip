import test from 'ava';

import { CORRECT } from './correctResult';
import { getCategories } from './mockedApi';
import { categoryTree } from './task';

test('should return correct data', async (t) => {
  const result = await categoryTree(getCategories);

  t.deepEqual(result, CORRECT);
});

test('should return empty array on error', async (t) => {
  const getCategoriesError = async () => {
    throw new Error('Error');
  };

  const result = await categoryTree(getCategoriesError);

  t.deepEqual(result, []);
});

test('should return empty array on empty data', async (t) => {
  const getCategoriesEmpty = async () => ({
    data: [],
  });

  const result = await categoryTree(getCategoriesEmpty);

  t.deepEqual(result, []);
});

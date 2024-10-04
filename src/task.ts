import { Category } from './mockedApi';

export interface CategoryListElement {
  name: string;
  id: number;
  image: string;
  order: number;
  children: CategoryListElement[];
  showOnHome: boolean;
}

type GetCategoriesFunc = () => Promise<{
  data: Category[];
}>;

const ORDER_SEPARATOR = '#';
const MAX_CATEGORIES_ON_HOME = 5;
const MIN_CATEGORIES_ON_HOME = 3;

const tryGetData = async (
  getCategoriesFunc: GetCategoriesFunc
): Promise<Category[]> => {
  try {
    const response = await getCategoriesFunc();

    return response.data;
  } catch (e) {
    // log error
    return [];
  }
};

const sortCategories = (
  categories: CategoryListElement[]
): CategoryListElement[] => categories.sort((a, b) => a.order - b.order);

const getOrder = (category: Category): number => {
  const order = category.Title;

  if (!order) return category.id;

  const orderParts = order.split(ORDER_SEPARATOR);
  const orderNumber = parseInt(orderParts[0]);

  if (isNaN(orderNumber)) return category.id;

  return orderNumber;
};

const mapCategory = (category: Category): CategoryListElement => ({
  id: category.id,
  name: category.name,
  image: category.MetaTagDescription,
  order: getOrder(category),
  children: category.children
    ? sortCategories(category.children.map(mapCategory))
    : [],
  showOnHome: false,
});

// basically not sure what to do with this part. I do not know business logic, so I live it as is with some refactoring:
const mapToShowOnHome = (
  categoriesList: CategoryListElement[],
  data: Category[]
): CategoryListElement[] => {
  if (categoriesList.length <= MAX_CATEGORIES_ON_HOME) {
    return categoriesList.map((category) => ({
      ...category,
      showOnHome: true,
    }));
  }

  const toShowOnHome = data.reduce((acc, category) => {
    if (category.Title?.includes(ORDER_SEPARATOR)) {
      acc.add(category.id);
    }
    return acc;
  }, new Set<number>());

  if (toShowOnHome.size > 0) {
    return categoriesList.map((category) => ({
      ...category,
      showOnHome: toShowOnHome.has(category.id),
    }));
  }

  return categoriesList.map((category, index) => ({
    ...category,
    showOnHome: index < MIN_CATEGORIES_ON_HOME,
  }));
};

export const categoryTree = async (
  getCategoriesFunc: GetCategoriesFunc
): Promise<CategoryListElement[]> => {
  const data = await tryGetData(getCategoriesFunc);
  const categories = sortCategories(data.map(mapCategory));

  return mapToShowOnHome(categories, data);
};

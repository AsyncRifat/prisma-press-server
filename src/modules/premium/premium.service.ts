import { PostWhereInput } from '../../../generated/prisma/models';
import { prisma } from '../../lib/prisma';
import { IPostQuery } from '../post/post.interface';
import { title } from 'node:process';

const getPremiumContent = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder ? query.sortOrder : 'desc';

  const tag = query.tag ? JSON.parse(query.tag as string) : null;
  const tagArray = Array.isArray(tag) ? tag : [];
  // console.log('tagArray----', tagArray);

  const andConditions: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: {
        contains: query.title,
        mode: 'insensitive',
      },
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }
  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured !== undefined) {
    andConditions.push({
      isFeatured: query.isFeatured === 'true',
    });
  }

  if (query.tag) {
    andConditions.push({
      tag: {
        hasSome: tagArray,
      },
    });
  }
  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  andConditions.push({
    isPremium: true,
  });

  const [posts, total] = await Promise.all([
    await prisma.post.findMany({
      where: {
        AND: andConditions,
      },
      take: limit,
      skip,

      orderBy: {
        // sortBy: SortOrder
        [sortBy]: sortOrder,
      },

      include: {
        author: {
          omit: {
            password: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        comments: true,
      },
    }),
    prisma.post.count({
      where: {
        AND: andConditions,
      },
    }),
  ]);

  const totalPage = Math.ceil(total / limit);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

export const premiumServices = {
  getPremiumContent,
};

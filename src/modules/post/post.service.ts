import { title } from 'node:process';
import { CommentStatus, PostStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import {
  ICreatePayload,
  IPostQuery,
  IUpdatePostPayload,
} from './post.interface';
import { PostWhereInput } from '../../../generated/prisma/models';

const createPost = async (payload: ICreatePayload, userId: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    },
  });

  if (payload.isPremium && user.subscription?.status !== 'ACTIVE') {
    throw new Error(
      'You are not a premium user. So you can not create a premium post',
    );
  }

  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async (query: IPostQuery) => {
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
  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
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
    isPremium: false,
  });

  //* ========= Before code without meta and data count =========
  // const posts = await prisma.post.findMany({
  //   //* filtering / exact value search :
  //   // where: {
  //   //   AND: [
  //   //     { title: 'abc' },
  //   //     { content: 'xyz' },
  //   //     {
  //   //       tag: {
  //   //         // equals: ['a', 'b', 'c', 'x', 'y', 'z'],
  //   //         has: 'x',
  //   //       },
  //   //     },
  //   //   ],
  //   // },
  //   //* searching / partial match :
  //   // where: {
  //   //   OR: [
  //   //     {
  //   //       title: {
  //   //         contains: 'express',
  //   //         mode: 'insensitive',
  //   //       },
  //   //     },
  //   //     {
  //   //       content: {
  //   //         contains: 'this',
  //   //         mode: 'insensitive',
  //   //       },
  //   //     },
  //   //   ],
  //   // },
  //   //* combining search and filtering :
  //   // where: {
  //   //   // filtering & searching combined:
  //   //   AND: [
  //   //     {
  //   //       // searching:
  //   //       OR: [
  //   //         {
  //   //           title: {
  //   //             contains: 'express',
  //   //             mode: 'insensitive',
  //   //           },
  //   //         },

  //   //         {
  //   //           content: {
  //   //             contains: 'PostgreSQL',
  //   //             mode: 'insensitive',
  //   //           },
  //   //         },
  //   //       ],
  //   //     },

  //   //     // filtering
  //   //     {
  //   //       title: {
  //   //         contains: 'Express',
  //   //         mode: 'insensitive',
  //   //       },
  //   //     },
  //   //     {
  //   //       content: {
  //   //         contains: 'Prisma',
  //   //         mode: 'insensitive',
  //   //       },
  //   //     },
  //   //   ],
  //   // },

  //   // *pagination: => page no = 3, limit/take = 10 -> (page no - 1) * limit/take
  //   // take: 2,
  //   // skip: 2,

  //   // where: {
  //   //   AND: [
  //   //     query.searchTerm
  //   //       ? {
  //   //           OR: [
  //   //             {
  //   //               title: {
  //   //                 contains: query.searchTerm,
  //   //                 mode: 'insensitive',
  //   //               },
  //   //             },
  //   //             {
  //   //               content: {
  //   //                 contains: query.searchTerm,
  //   //                 mode: 'insensitive',
  //   //               },
  //   //             },
  //   //           ],
  //   //         }
  //   //       : {},

  //   //     // title filtering:
  //   //     query.title ? { title: query.title } : {},

  //   //     // content filtering:
  //   //     query.content ? { content: query.content } : {},
  //   //   ],
  //   // },

  //   where: {
  //     AND: andConditions,
  //   },

  //   take: limit,
  //   skip: skip,

  //   orderBy: {
  //     // sortBy: SortOrder
  //     [sortBy]: sortOrder,
  //   },

  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //         role: true,
  //         createdAt: true,
  //         updatedAt: true,
  //       },
  //     },
  //     comments: true,
  //   },
  // });

  const [posts, total] = await Promise.all([
    await prisma.post.findMany({
      where: {
        AND: andConditions,
      },

      take: limit,
      skip: skip,

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

const getPostsStats = async () => {
  const transactionResult = await prisma.$transaction(async tx => {
    // const totalPosts = await tx.post.count();

    // const totalPublishedPost = await tx.post.count({
    //   where: {
    //     status: PostStatus.PUBLISHED,
    //   },
    // });
    // const totalDraftPost = await tx.post.count({
    //   where: {
    //     status: PostStatus.DRAFT,
    //   },
    // });
    // const totalArchivedPost = await tx.post.count({
    //   where: {
    //     status: PostStatus.ARCHIVED,
    //   },
    // });

    // const totalComments = await tx.comment.count();

    // const totalApprovedComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.APPROVED,
    //   },
    // });
    // const totalRejectComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.REJECT,
    //   },
    // });

    // all posts total views (wrong way)
    // const allPosts = await tx.post.findMany();
    // let totalPostViews = 0;
    // allPosts.forEach(post => {
    //   totalPostViews = totalPostViews + post.views;
    // });

    // better way
    // const totalPostsViewsAggregate = await tx.post.aggregate({
    //   _sum: {
    //     views: true,
    //   },
    // });
    // const totalPostViews = totalPostsViewsAggregate._sum.views;

    // return {
    //   totalPosts,
    //   totalPublishedPost,
    //   totalDraftPost,
    //   totalArchivedPost,
    //   totalComments,
    //   totalApprovedComments,
    //   totalRejectComments,
    //   totalPostViews,
    // };

    const [
      totalPosts,
      totalPublishedPost,
      totalDraftPost,
      totalArchivedPost,
      totalComments,
      totalApprovedComments,
      totalRejectComments,
      totalPostViews,
    ] = await Promise.all([
      await tx.post.count(),

      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),

      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),

      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),

      await tx.comment.count(),

      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),

      await tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),

      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPost,
      totalDraftPost,
      totalArchivedPost,
      totalComments,
      totalApprovedComments,
      totalRejectComments,
      totalPostView: totalPostViews._sum.views ?? 0,
    };
  });

  return transactionResult;
};

const getMyPost = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: 'desc',
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

      // comments count
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

const getPostById = async (postId: string) => {
  // const updatePost = await prisma.post.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     views: {
  //       increment: 1,
  //     },
  //   },
  // });

  // throw new Error('fake error');

  // const post = await prisma.post.findUniqueOrThrow({
  //   where: {
  //     id: postId,
  //   },
  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //         role: true,
  //         createdAt: true,
  //         updatedAt: true,
  //       },
  //     },
  //     comments: {
  //       where: {
  //         status: CommentStatus.APPROVED,
  //       },
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //     },

  //     _count: {
  //       select: {
  //         comments: true,
  //       },
  //     },
  //   },
  // });

  const transactionResult = await prisma.$transaction(async tx => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // throw new Error('fake error');
    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
        isPremium: false,
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
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },

        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return post;
  });

  return transactionResult;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: authorId,
    },
    include: {
      subscription: true,
    },
  });

  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  // owner check
  if (!isAdmin && post.authorId !== authorId) {
    throw new Error('You are not the owner of this post');
  }

  const wantsPremium = post.isPremium || payload.isPremium === true;

  // existing post premium subscription needed
  if (wantsPremium && user.subscription?.status !== 'ACTIVE') {
    throw new Error(
      'You need an active subscription to update this premium post',
    );
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
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

      // comments count
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: authorId,
    },
    include: {
      subscription: true,
    },
  });

  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  // owner check
  if (!isAdmin && post.authorId !== authorId) {
    throw new Error('You are not the owner of this post');
  }

  // premium post check and subscription status check
  if (!isAdmin && post.isPremium && user.subscription?.status !== 'ACTIVE') {
    throw new Error(
      'You need an active subscription to delete this premium post',
    );
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return null;
};

export const postService = {
  createPost,
  getAllPosts,
  getPostsStats,
  getMyPost,
  getPostById,
  updatePost,
  deletePost,
};

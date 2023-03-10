import { PaginationAndSortQueryParams, Paginator, SortDirections } from "../../../@types";
import { ObjectId, WithId } from "mongodb";
import { getObjectToSort } from "../../../utils/common/getObjectToSort";
import { postsCollection } from "../../adapters/mongoDB";
import { PostViewModel } from "../../../service-layer/response/responseTypes";

export const postsQueryRepository = {
  getAllPosts: async <T>({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = "",
  }): Promise<Paginator<WithId<T>[]>> => {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;

    const totalCount = await postsCollection.countDocuments({});
    const res = await postsCollection
      .find<WithId<T>>({})
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting)
      .toArray();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: res,
    };
  },

  getAllPostsByBlogId: async ({
    pageSize = 10,
    pageNumber = 1,
    sortDirection = SortDirections.DESC,
    sortBy = "",
    id,
  }: PaginationAndSortQueryParams & { id: string }): Promise<Paginator<WithId<PostViewModel>[]>> => {
    const sorting = getObjectToSort({ sortBy, sortDirection });
    const pageSizeValue = pageSize < 1 ? 1 : pageSize;

    const totalCount = await postsCollection.find({ blogId: id }).count();
    const res = await postsCollection
      .find<WithId<PostViewModel>>({ blogId: id })
      .skip((+pageNumber - 1) * +pageSizeValue)
      .limit(+pageSizeValue)
      .sort(sorting)
      .toArray();

    console.log(res);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount,
      items: res,
    };
  },

  getPostById: async <T>(postId: string): Promise<WithId<T> | null> => {
    const isValidId = ObjectId.isValid(postId);

    if (isValidId) {
      const data = await postsCollection.findOne<WithId<T>>({ _id: new ObjectId(postId) });

      if (data) {
        return data;
      }
    }

    return null;
  },
};

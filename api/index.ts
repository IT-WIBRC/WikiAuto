import {
  GenericErrors,
  type SupabaseChannel,
  type ApiResponseResult,
  type ApiResponseResultWitForm,
  type ResponseOnError,
  type ApiRouteErrorBody,
  type GenericErrorsKeys,
  type UIResponseOnError,
  type UIApiResponseResult,
} from "./types/apiResponse";

import type { Badge, GetBadgeListTypeForOption } from "./types/badge";
import {
  CONTENT_STATUS,
  CONTENT_RESPONSE_STATUS,
  type ContentCreation,
  type ContentEdition,
  type GetContentListItem,
  type GetContentDetailsType,
  type Content,
} from "./types/content";

import type { GetProfile, EditProfileInfoPayload } from "./types/profile";

import { badgeService } from "./badgeService";
import { contentService } from "./contentService";
import { authService } from "./authService";
import { imageService } from "./imageService";

import {
  wrapServiceCall,
  type ServiceWrapperSuccess,
} from "./utils/wrapServiceCall";
import {
  processEitherResult,
  isArrayOfData,
  isObjectOfData,
  handleSingleItemResponse,
  handleListResponse,
} from "./utils/serviceResponseUtilities";
import {
  type IEither, Either, Maybe
} from "./utils/monads";

import { realtimeObserver } from "./realtime/realtimeObserver";
import type { ListenEvent } from "./realtime/liveChannel";

export {
  // commons
  GenericErrors,
  type ApiResponseResultWitForm,
  type ApiResponseResult,
  type SupabaseChannel,
  type ResponseOnError,
  type ApiRouteErrorBody,
  type GenericErrorsKeys,
  type UIApiResponseResult,
  type UIResponseOnError,

  //content
  CONTENT_RESPONSE_STATUS,
  CONTENT_STATUS,
  type ContentCreation,
  type ContentEdition,
  type GetContentListItem,
  type GetContentDetailsType,
  type Content,

  //Badge
  type Badge,
  type GetBadgeListTypeForOption,

  // Profile
  type EditProfileInfoPayload,
  type GetProfile,

  //Services,
  badgeService,
  contentService,
  authService,
  imageService,

  //Utils
  wrapServiceCall,
  type ServiceWrapperSuccess,
  processEitherResult,
  handleListResponse,
  handleSingleItemResponse,
  isArrayOfData,
  isObjectOfData,

  // Monads
  type IEither,
  Maybe,
  Either,

  //Realtime
  realtimeObserver,
  type ListenEvent,
};

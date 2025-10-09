/** biome-ignore-all lint/suspicious/noExplicitAny: <scraped data> */
interface SubtitleInfo {
  UrlExpire: string;
  Size: string;
  LanguageID: string;
  LanguageCodeName: string;
  Url: string;
  Format: string;
  Version: string;
  Source: string;
}

interface ZoomCover {
  "240": string;
  "480": string;
  "720": string;
  "960": string;
}

interface VolumeInfo {
  Loudness: number;
  Peak: number;
}

interface PlayAddr {
  DataSize: string;
  Width: number;
  Height: number;
  Uri: string;
  UrlList: string[];
  UrlKey: string;
  FileHash: string;
  FileCs: string;
}

interface BitrateInfo {
  Bitrate: number;
  QualityType: number;
  BitrateFPS: number;
  GearName: string;
  PlayAddr: PlayAddr;
  CodecType: string;
  MVMAF: string;
  Format: string;
  VideoExtra: string;
}

interface ClaInfo {
  hasOriginalAudio: boolean;
  enableAutoCaption: boolean;
  captionInfos: any[];
  noCaptionReason: number;
}

interface Video {
  id: string;
  height: number;
  width: number;
  duration: number;
  ratio: string;
  cover: string;
  originCover: string;
  dynamicCover: string;
  playAddr: string;
  downloadAddr: string;
  shareCover: string[];
  reflowCover: string;
  bitrate: number;
  encodedType: string;
  format: string;
  videoQuality: string;
  encodeUserTag: string;
  codecType: string;
  definition: string;
  subtitleInfos: SubtitleInfo[];
  zoomCover: ZoomCover;
  volumeInfo: VolumeInfo;
  bitrateInfo: BitrateInfo[];
  size: string;
  VQScore: string;
  claInfo: ClaInfo;
  videoID: string;
  PlayAddrStruct: PlayAddr;
}

interface Author {
  id: string;
  shortId: string;
  uniqueId: string;
  nickname: string;
  avatarLarger: string;
  avatarMedium: string;
  avatarThumb: string;
  signature: string;
  createTime: number;
  verified: boolean;
  secUid: string;
  ftc: boolean;
  relation: number;
  openFavorite: boolean;
  commentSetting: number;
  duetSetting: number;
  stitchSetting: number;
  privateAccount: boolean;
  secret: boolean;
  isADVirtual: boolean;
  roomId: string;
  uniqueIdModifyTime: number;
  ttSeller: boolean;
  downloadSetting: number;
  recommendReason: string;
  nowInvitationCardUrl: string;
  nickNameModifyTime: number;
  isEmbedBanned: boolean;
  canExpPlaylist: boolean;
  suggestAccountBind: boolean;
  UserStoryStatus: number;
}

interface PreciseDuration {
  preciseDuration: number;
  preciseShootDuration: number;
  preciseAuditionDuration: number;
  preciseVideoDuration: number;
}

interface TT2DSP {
  tt_to_dsp_song_infos: any[];
}

interface Music {
  id: string;
  title: string;
  playUrl: string;
  coverLarge: string;
  coverMedium: string;
  coverThumb: string;
  authorName: string;
  original: boolean;
  private: boolean;
  duration: number;
  scheduleSearchTime: number;
  collected: boolean;
  preciseDuration: PreciseDuration;
  isCopyrighted: boolean;
  tt2dsp: TT2DSP;
}

interface Challenge {
  id: string;
  title: string;
  desc: string;
  profileLarger: string;
  profileMedium: string;
  profileThumb: string;
  coverLarger: string;
  coverMedium: string;
  coverThumb: string;
}

interface Stats {
  diggCount: number;
  shareCount: number;
  commentCount: number;
  playCount: number;
  collectCount: string;
}

interface StatsV2 {
  diggCount: string;
  shareCount: string;
  commentCount: string;
  playCount: string;
  collectCount: string;
  repostCount: string;
}

interface TextExtra {
  awemeId: string;
  start: number;
  end: number;
  hashtagId: string;
  hashtagName: string;
  type: number;
  subType: number;
  isCommerce: boolean;
}

interface AuthorStats {
  followerCount: number;
  followingCount: number;
  heart: number;
  heartCount: number;
  videoCount: number;
  diggCount: number;
  friendCount: number;
}

interface AuthorStatsV2 {
  followerCount: string;
  followingCount: string;
  heart: string;
  heartCount: string;
  videoCount: string;
  diggCount: string;
  friendCount: string;
}

interface Content {
  desc: string;
  textExtra: TextExtra[];
}

interface ItemControl {
  can_repost: boolean;
}

interface ItemStruct {
  id: string;
  desc: string;
  createTime: string;
  scheduleTime: number;
  video: Video;
  author: Author;
  music: Music;
  challenges: Challenge[];
  stats: Stats;
  statsV2: StatsV2;
  warnInfo: any[];
  originalItem: boolean;
  officalItem: boolean;
  textExtra: TextExtra[];
  secret: boolean;
  forFriend: boolean;
  digged: boolean;
  itemCommentStatus: number;
  takeDown: number;
  effectStickers: any[];
  authorStats: AuthorStats;
  privateItem: boolean;
  duetEnabled: boolean;
  stitchEnabled: boolean;
  stickersOnItem: any[];
  isAd: boolean;
  shareEnabled: boolean;
  comments: any[];
  duetDisplay: number;
  stitchDisplay: number;
  indexEnabled: boolean;
  diversificationLabels: string[];
  locationCreated: string;
  suggestedWords: any[];
  contents: Content[];
  diversificationId: number;
  collected: boolean;
  channelTags: any[];
  item_control: ItemControl;
  IsAigc: boolean;
  AIGCDescription: string;
  backendSourceEventTracking: string;
  CategoryType: number;
  textLanguage: string;
  textTranslatable: boolean;
  authorStatsV2: AuthorStatsV2;
  isReviewing: boolean;
}

export type TikTokJSONDataVideoDetail = {
  itemInfo: {
    itemStruct: ItemStruct;
  };
};

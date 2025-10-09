/** biome-ignore-all lint/suspicious/noExplicitAny: <scraped data> */

interface XDTMediaWebInfo {
  items: MediaItem[];
}

interface MediaItem {
  code: string;
  pk: string;
  id: string;
  ad_id: string | null;
  taken_at: number;
  inventory_source: string | null;
  video_versions: VideoVersion[];
  coauthor_producers: any[];
  invited_coauthor_producers: any[];
  facepile_top_likers: any[];
  is_dash_eligible: number;
  number_of_qualities: number;
  video_dash_manifest: string;
  image_versions2: ImageVersions;
  is_paid_partnership: boolean;
  sponsor_tags: any | null;
  original_height: number;
  original_width: number;
  organic_tracking_token: string;
  user: UserDict;
  group: any | null;
  comments_disabled: boolean | null;
  like_and_view_counts_disabled: boolean;
  can_viewer_reshare: boolean;
  product_type: string;
  media_type: number;
  usertags: any | null;
  media_overlay_info: any | null;
  carousel_media: any | null;
  location: any | null;
  has_audio: boolean;
  media_notes: MediaNotes;
  clips_metadata: ClipsMetadata;
  clips_attribution_info: any | null;
  has_liked: boolean;
  open_carousel_submission_state: any | null;
  carousel_parent_id: any | null;
  display_uri: any | null;
  preview: any | null;
  accessibility_caption: any | null;
  previous_submitter: any | null;
  link: any | null;
  story_cta: any | null;
  like_count: number;
  logging_info_token: any | null;
  owner: Owner;
  carousel_media_count: number | null;
  comment_count: number;
  preview_comments: any[];
  view_count: number | null;
  top_likers: string[];
  hidden_likes_string_variant: number;
  fb_like_count: number | null;
  crosspost_metadata: CrosspostMetadata;
  social_context: any[];
  can_reshare: boolean | null;
  saved_collection_ids: any | null;
  has_viewer_saved: boolean | null;
  sharing_friction_info: SharingFrictionInfo;
  caption: Caption;
  boosted_status: any | null;
  boost_unavailable_identifier: any | null;
  boost_unavailable_reason: any | null;
  can_see_insights_as_brand: boolean;
  affiliate_info: any | null;
  main_feed_carousel_starting_media_id: any | null;
  ig_media_sharing_disabled: boolean;
  feed_demotion_control: any | null;
  feed_recs_demotion_control: any | null;
  is_shared_from_basel: boolean | null;
  fb_comment_count: number | null;
  all_previous_submitters: any | null;
  follow_hashtag_info: any | null;
  media_attributions_data: any[];
  wearable_attribution_info: any | null;
  caption_is_edited: boolean;
  commenting_disabled_for_viewer: boolean | null;
}

interface VideoVersion {
  width: number;
  height: number;
  url: string;
  type: number;
}

interface ImageVersions {
  candidates: ImageCandidate[];
}

interface ImageCandidate {
  url: string;
  height: number;
  width: number;
}

interface UserDict {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
  is_embeds_disabled: boolean;
  is_unpublished: boolean;
  is_verified: boolean;
  friendship_status: FriendshipStatus;
  latest_reel_media: number;
  id: string;
  __typename: string;
  live_broadcast_visibility: any | null;
  live_broadcast_id: any | null;
  hd_profile_pic_url_info: ProfilePicUrlInfo;
}

interface FriendshipStatus {
  blocking?: boolean | null;
  followed_by: boolean;
  following: boolean;
  incoming_request?: boolean | null;
  is_private: boolean;
  is_restricted?: boolean;
  is_viewer_unconnected?: boolean | null;
  muting?: boolean | null;
  outgoing_request?: boolean | null;
  subscribed?: boolean | null;
  is_feed_favorite?: boolean;
}

interface ProfilePicUrlInfo {
  url: string;
}

interface MediaNotes {
  items: any[];
}

interface ClipsMetadata {
  audio_type: string;
  achievements_info: AchievementsInfo;
  music_info: any | null;
  original_sound_info: OriginalSoundInfo;
  is_shared_to_fb: boolean;
}

interface AchievementsInfo {
  show_achievements: boolean;
}

interface OriginalSoundInfo {
  original_audio_title: string;
  should_mute_audio: boolean;
  audio_asset_id: string;
  consumption_info: ConsumptionInfo;
  ig_artist: IgArtist;
  is_explicit: boolean;
}

interface ConsumptionInfo {
  should_mute_audio_reason: string;
  should_mute_audio_reason_type: any | null;
  is_trending_in_clips: boolean;
}

interface IgArtist {
  username: string;
  id: string;
}

interface Owner {
  pk: string;
  id: string;
  username: string;
  profile_pic_url: string;
  show_account_transparency_details: boolean;
  __typename: string;
  is_private: boolean;
  friendship_status: OwnerFriendshipStatus;
  transparency_product: any | null;
  transparency_product_enabled: boolean;
  transparency_label: any | null;
  ai_agent_owner_username: any | null;
  is_unpublished: boolean;
  is_verified: boolean;
}

interface OwnerFriendshipStatus {
  following: boolean;
}

interface CrosspostMetadata {
  is_feedback_aggregated: boolean | null;
}

interface SharingFrictionInfo {
  should_have_sharing_friction: boolean;
  bloks_app_url: any | null;
}

interface Caption {
  text: string;
  pk: string;
  has_translation: boolean | null;
  created_at: number;
}

export type InstagramJSONData = {
  xdt_api__v1__media__shortcode__web_info: XDTMediaWebInfo;
};

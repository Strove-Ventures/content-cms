import type { Schema, Attribute } from '@strapi/strapi';

export interface SharedTileCollection extends Schema.Component {
  collectionName: 'components_shared_tile_collections';
  info: {
    displayName: 'Tile collection';
    description: '';
  };
  attributes: {
    tiles: Attribute.Component<'shared.content-tile'>;
  };
}

export interface SharedSlider extends Schema.Component {
  collectionName: 'components_shared_sliders';
  info: {
    displayName: 'Slider';
    icon: 'address-book';
    description: '';
  };
  attributes: {
    files: Attribute.Media<'images', true>;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    name: 'Seo';
    icon: 'allergies';
    displayName: 'Seo';
    description: '';
  };
  attributes: {
    metaTitle: Attribute.String & Attribute.Required;
    metaDescription: Attribute.Text & Attribute.Required;
    shareImage: Attribute.Media<'images'>;
  };
}

export interface SharedRicherText extends Schema.Component {
  collectionName: 'components_shared_richer_texts';
  info: {
    displayName: 'Richer Text';
  };
  attributes: {};
}

export interface SharedRichText extends Schema.Component {
  collectionName: 'components_shared_rich_texts';
  info: {
    displayName: 'Rich text';
    icon: 'align-justify';
    description: '';
  };
  attributes: {
    body: Attribute.RichText;
  };
}

export interface SharedQuote extends Schema.Component {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    title: Attribute.String;
    body: Attribute.Text;
  };
}

export interface SharedPoints extends Schema.Component {
  collectionName: 'components_shared_points';
  info: {
    displayName: 'points';
    description: '';
  };
  attributes: {
    value: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
    earnable: Attribute.Boolean & Attribute.DefaultTo<true>;
    imageUrl: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'https://lively-crystal-f13b3a6e8c.media.strapiapp.com/Asset_339_4x_1_48fc1f359f.png'>;
  };
}

export interface SharedMedia extends Schema.Component {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedLibrarySection extends Schema.Component {
  collectionName: 'components_shared_library_sections';
  info: {
    displayName: 'Library section';
    description: '';
  };
  attributes: {
    order: Attribute.Integer;
    title: Attribute.String;
    libraryContents: Attribute.Relation<
      'shared.library-section',
      'oneToMany',
      'api::library-content.library-content'
    >;
    type: Attribute.Enumeration<
      [
        'large-tile-list',
        'standard-tile-list',
        'narrow-tile-list',
        'long-tile-list'
      ]
    >;
  };
}

export interface SharedFilterTags extends Schema.Component {
  collectionName: 'components_shared_filter_tags';
  info: {
    displayName: 'Filter tags';
    description: '';
  };
  attributes: {
    tags: Attribute.Relation<'shared.filter-tags', 'oneToMany', 'api::tag.tag'>;
    title: Attribute.String & Attribute.Required;
    order: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
  };
}

export interface SharedDuration extends Schema.Component {
  collectionName: 'components_shared_durations';
  info: {
    displayName: 'Duration';
    icon: 'clock';
    description: '';
  };
  attributes: {
    label: Attribute.String & Attribute.DefaultTo<'min'>;
    value: Attribute.Integer & Attribute.Required;
    imageUrl: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'https://lively-crystal-f13b3a6e8c.media.strapiapp.com/clock_cabec89325.png'>;
  };
}

export interface SharedContentTile extends Schema.Component {
  collectionName: 'components_shared_content_tiles';
  info: {
    displayName: 'content tile';
    description: '';
  };
  attributes: {
    contents: Attribute.Relation<
      'shared.content-tile',
      'oneToMany',
      'api::library-content.library-content'
    >;
  };
}

export interface SharedActions extends Schema.Component {
  collectionName: 'components_shared_actions';
  info: {
    displayName: 'Actions';
    description: '';
  };
  attributes: {
    action_type: Attribute.String;
    action_label: Attribute.String;
    action_url: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.tile-collection': SharedTileCollection;
      'shared.slider': SharedSlider;
      'shared.seo': SharedSeo;
      'shared.richer-text': SharedRicherText;
      'shared.rich-text': SharedRichText;
      'shared.quote': SharedQuote;
      'shared.points': SharedPoints;
      'shared.media': SharedMedia;
      'shared.library-section': SharedLibrarySection;
      'shared.filter-tags': SharedFilterTags;
      'shared.duration': SharedDuration;
      'shared.content-tile': SharedContentTile;
      'shared.actions': SharedActions;
    }
  }
}

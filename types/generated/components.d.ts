import type { Struct, Schema } from '@strapi/strapi';

export interface SharedTileCollection extends Struct.ComponentSchema {
  collectionName: 'components_shared_tile_collections';
  info: {
    displayName: 'Tile collection';
    description: '';
  };
  attributes: {
    tiles: Schema.Attribute.Component<'shared.content-tile', false>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    displayName: 'Slider';
    icon: 'address-book';
    description: '';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    name: 'Seo';
    icon: 'allergies';
    displayName: 'Seo';
    description: '';
  };
  attributes: {
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    title: Schema.Attribute.String;
    body: Schema.Attribute.Text;
  };
}

export interface SharedPoints extends Struct.ComponentSchema {
  collectionName: 'components_shared_points';
  info: {
    displayName: 'points';
    description: '';
  };
  attributes: {
    value: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1>;
    earnable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    imageUrl: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'https://lively-crystal-f13b3a6e8c.media.strapiapp.com/Asset_339_4x_1_48fc1f359f.png'>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedLibrarySection extends Struct.ComponentSchema {
  collectionName: 'components_shared_library_sections';
  info: {
    displayName: 'Library section';
    description: '';
  };
  attributes: {
    order: Schema.Attribute.Integer;
    title: Schema.Attribute.String;
    libraryContents: Schema.Attribute.Relation<
      'oneToMany',
      'api::library-content.library-content'
    >;
    type: Schema.Attribute.Enumeration<
      [
        'large-tile-list',
        'standard-tile-list',
        'narrow-tile-list',
        'long-tile-list',
      ]
    >;
    category: Schema.Attribute.Relation<'oneToOne', 'api::category.category'>;
  };
}

export interface SharedFilterTags extends Struct.ComponentSchema {
  collectionName: 'components_shared_filter_tags';
  info: {
    displayName: 'Filter tags';
    description: '';
  };
  attributes: {
    tags: Schema.Attribute.Relation<'oneToMany', 'api::tag.tag'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1>;
  };
}

export interface SharedDuration extends Struct.ComponentSchema {
  collectionName: 'components_shared_durations';
  info: {
    displayName: 'Duration';
    icon: 'clock';
    description: '';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'min'>;
    value: Schema.Attribute.Integer & Schema.Attribute.Required;
    imageUrl: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'https://lively-crystal-f13b3a6e8c.media.strapiapp.com/clock_cabec89325.png'>;
  };
}

export interface SharedContentTile extends Struct.ComponentSchema {
  collectionName: 'components_shared_content_tiles';
  info: {
    displayName: 'content tile';
    description: '';
  };
  attributes: {
    contents: Schema.Attribute.Relation<
      'oneToMany',
      'api::library-content.library-content'
    >;
  };
}

export interface SharedActions extends Struct.ComponentSchema {
  collectionName: 'components_shared_actions';
  info: {
    displayName: 'Actions';
    description: '';
  };
  attributes: {
    action_type: Schema.Attribute.String;
    action_label: Schema.Attribute.String;
    action_url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.tile-collection': SharedTileCollection;
      'shared.slider': SharedSlider;
      'shared.seo': SharedSeo;
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

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
    tiles: Attribute.Component<'shared.content-tile', true>;
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
    duration: Attribute.String;
    icon: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface SharedContentTile extends Schema.Component {
  collectionName: 'components_shared_content_tiles';
  info: {
    displayName: 'content tile';
    description: '';
  };
  attributes: {
    cont: Attribute.Relation<
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
      'shared.rich-text': SharedRichText;
      'shared.quote': SharedQuote;
      'shared.media': SharedMedia;
      'shared.library-section': SharedLibrarySection;
      'shared.duration': SharedDuration;
      'shared.content-tile': SharedContentTile;
      'shared.actions': SharedActions;
    }
  }
}

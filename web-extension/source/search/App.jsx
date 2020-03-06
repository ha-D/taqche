import React from 'react';
import extend from 'lodash/extend';
import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  HitsStats, SortingSelector, NoHits,
  ResetFilters, ViewSwitcherHits, ViewSwitcherToggle, InputFilter, GroupedSelectedFilters,
  Layout, TopBar, LayoutBody, LayoutResults,
  ActionBar, ActionBarRow, SideBar } from 'searchkit';
import './index.css';

const host = localStorage.getItem('es_url');
const searchkit = new SearchkitManager(host);

const GridItem = props => {
  const { bemBlocks, result } = props;
  const source = extend({}, result._source, result.highlight);
  const thumbnail = `https://img.youtube.com/vi/${source.source_id}/0.jpg`;
  const url = `https://www.youtube.com/watch?v=${source.source_id}`;
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container('item'))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" alt="presentation" className={bemBlocks.item('poster')} src={thumbnail} width="240" height="135"/>
        <div data-qa="title" className={bemBlocks.item('title')} dangerouslySetInnerHTML={{__html:source.title}}></div>
      </a>
    </div>
  );
};

const TagChip = tag => (<div key={tag} className="chip chip-tag">{tag}</div>);
const AnnotationChip = annotation => (<div key={annotation} className="chip chip-annotation">{annotation}</div>);

function timeFormat(value) {
  const minutes = `0${Math.floor(Math.floor(value) / 60)}`.slice(-2);
  const seconds = `0${Math.floor(value) % 60}`.slice(-2);
  return `${minutes}:${seconds}`;
}

const ListItem = props => {
  const { bemBlocks, result } = props;
  const source = extend({}, result._source, result.highlight);
  const thumbnail = `https://img.youtube.com/vi/${source.source_id}/0.jpg`;
  let url = `https://www.youtube.com/watch?v=${source.source_id}`;
  let title = source.title;
  if (source.start) {
    url = `${url}&t=${source.start}`;
    title = `[${timeFormat(source.start)} - ${timeFormat(source.end)}]  ${title}`;
  }
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container('item'))} data-qa="hit">
      <div className={bemBlocks.item('poster')}>
        <a href={url} target="_blank">
          <img alt="presentation" src={thumbnail}/>
        </a>
      </div>
      <div className={bemBlocks.item('details')}>
        <a href={url} target="_blank"><h2 className={bemBlocks.item('title')} dangerouslySetInnerHTML={{__html:title}} /></a>
        <h3 className={bemBlocks.item('subtitle')}>{source.channel} - {source.date}</h3>
        <div className="chip-container">
          {(source.tags || []).map(TagChip)}
          {(source.annotations || []).map(AnnotationChip)}
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <SearchkitProvider searchkit={searchkit}>
    <Layout>
      <TopBar>
        <div className="my-logo">Taqche Search</div>
        <SearchBox autofocus searchOnChange prefixQueryFields={['annotations^3', 'tags^2', 'title^1']} />
      </TopBar>

      <LayoutBody>
        <SideBar>
          <InputFilter id="tags" searchThrottleTime={500} title="Tags" placeholder="Search tags" searchOnChange queryFields={['tags']} />
          <RefinementListFilter id="tagsFacet" title="Tags" field="tags.raw" size={10} operator="OR" />
          <InputFilter id="channel" searchThrottleTime={500} title="Channels" placeholder="Search channels" searchOnChange queryFields={['channel']} />
          <RefinementListFilter id="channelFacet" title="Channels" field="channel.raw" size={10} operator="OR" />
        </SideBar>
        <LayoutResults>
          <ActionBar>

            <ActionBarRow>
              <HitsStats translations={{
                'hitstats.results_found': '{hitCount} results found',
              }} />
              <ViewSwitcherToggle />
              <SortingSelector options={[
                { label: 'Relevance', field: '_score', order: 'desc' },
                { label: 'Latest', field: 'date', order: 'desc' },
                { label: 'Oldest', field: 'date', order: 'asc' },
              ]} />
            </ActionBarRow>

            <ActionBarRow>
              <GroupedSelectedFilters />
              <ResetFilters />
            </ActionBarRow>

          </ActionBar>
          <ViewSwitcherHits
            hitsPerPage={12}
            highlightFields={['title']}
            hitComponents={[
              { key: 'list', title: 'List', itemComponent: ListItem, defaultOption: true },
              { key: 'grid', title: 'Grid', itemComponent: GridItem },
            ]}
            scrollTo="body"
          />
          <NoHits suggestionsField="title" />
          <Pagination showNumbers />
        </LayoutResults>
      </LayoutBody>
    </Layout>
  </SearchkitProvider>
);

export default App;

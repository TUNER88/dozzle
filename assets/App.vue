<template lang="html">
  <div class="columns is-marginless">
    <side-menu></side-menu>
    <div class="column is-offset-3-tablet is-offset-2-widescreen is-9-tablet is-10-widescreen is-paddingless">
      <splitpanes>
        <pane>
          <router-view></router-view>
        </pane>
        <pane v-for="other in activeContainers" :key="other.id">
          <scrollable-view>
            <template v-slot:header>
              <div class="name columns is-marginless">
                <span class="column">{{ other.name }}</span>
                <span class="column is-narrow">
                  <button class="delete is-medium" @click="removeActiveContainer(other)"></button>
                </span>
              </div>
            </template>
            <log-viewer-with-source :id="other.id"></log-viewer-with-source>
          </scrollable-view>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { Splitpanes, Pane } from "splitpanes";

import LogViewerWithSource from "./components/LogViewerWithSource";
import ScrollableView from "./components/ScrollableView";
import SideMenu from "./components/SideMenu";

export default {
  name: "App",
  components: {
    LogViewerWithSource,
    SideMenu,
    ScrollableView,
    Splitpanes,
    Pane
  },
  data() {
    return {
      title: "",
      showNav: false
    };
  },
  metaInfo() {
    return {
      title: this.title,
      titleTemplate: "%s - Dozzle"
    };
  },
  async created() {
    await this.fetchContainerList();
    this.title = `${this.containers.length} containers`;
  },
  computed: {
    ...mapState(["containers", "activeContainers"])
  },
  methods: {
    ...mapActions({
      fetchContainerList: "FETCH_CONTAINERS",
      removeActiveContainer: "REMOVE_ACTIVE_CONTAINER"
    })
  },
  watch: {
    $route(to, from) {
      this.showNav = false;
    }
  }
};
</script>

<style scoped lang="scss">
.name {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.1);
  font-weight: bold;
  font-family: monospace;
}

::v-deep .splitpanes__splitter {
  min-width: 4px;
  background: #666;
}
</style>

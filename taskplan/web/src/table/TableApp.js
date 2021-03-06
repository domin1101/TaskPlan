import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import "@fortawesome/fontawesome-free/css/all.min.css"

import React from 'react';
import ReconnectingEventSource from "reconnecting-eventsource";
import Repository from "../Repository";
import Table from "./Table";
import Project from "../Project";


class TableApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            noConnection: true,
            devices: [],
            saved_filters: [],
            refreshRate: null
        };

        this.evtSource = new ReconnectingEventSource("/update", {});
        this.repository = new Repository(this.evtSource);
        this.projectManagerRef = React.createRef();

        this.refreshConnectionState = this.refreshConnectionState.bind(this);

        this.evtSource.onerror = this.refreshConnectionState;
        this.evtSource.onopen = this.refreshConnectionState;

        this.state.noConnection = (this.evtSource.readyState === 0);

        this.evtSource.addEventListener("PROJECT_CHANGED", (e) => {
            const data = JSON.parse(e.data);
            this.setState({
               // current_code_version: data.current_code_version,
                saved_filters: data.saved_filters,
               // tensorboard_port: data.tensorboard_port,
                refreshRate: parseInt(data.refreshRate),
                allTags: data.all_tags,
            });
        });
    }

    refreshConnectionState() {        this.setState({
            noConnection: this.evtSource.readyState === 0
        });
    }

    render() {
        return (
            <div id="page">
                <div className="container">
                    <div className="row">
                        {this.state.refreshRate !== null &&
                            <Table
                                repository={this.repository}
                                saved_filters={this.state.saved_filters}
                                allTags={this.state.allTags}
                                refreshRate={this.state.refreshRate}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default TableApp;
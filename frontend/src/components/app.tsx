import {h, Component} from "preact";
import {useState, useEffect} from "preact/hooks";
import { ITerminalOptions, ITheme } from 'xterm';
import { Xterm } from './terminal';




const termOptions = {
    fontSize: 13,
    fontFamily: 'Menlo For Powerline,Consolas,Liberation Mono,Menlo,Courier,monospace',
    theme: {
        foreground: '#d2d2d2',
        background: '#2b2b2b',
        cursor: '#adadad',
        black: '#000000',
        red: '#d81e00',
        green: '#5ea702',
        yellow: '#cfae00',
        blue: '#427ab3',
        magenta: '#89658e',
        cyan: '#00a7aa',
        white: '#dbded8',
        brightBlack: '#686a66',
        brightRed: '#f54235',
        brightGreen: '#99e343',
        brightYellow: '#fdeb61',
        brightBlue: '#84b0d8',
        brightMagenta: '#bc94b7',
        brightCyan: '#37e6e8',
        brightWhite: '#f1f1f0',
    } as ITheme,
} as ITerminalOptions;

export function App() {

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const path = window.location.pathname.replace(/[\/]+$/, '');
const ws = [protocol, '//', window.location.host, path, '/ws', window.location.search].join('');
const token = [window.location.protocol, '//', window.location.host, path, '/token'].join('');

    const id = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);




const [wsUrl, setWsUrl] = useState('');
const [tokenUrl, setTokenUrl] = useState('');


useEffect(() => {
    async function init() {
        let response = await fetch('http://pi.siwiec.us/fault/container/' + id, {
            method: 'GET',
        });
        let urltext = await response.text();
        let urls = JSON.parse(urltext);
        console.log(urls)
        setWsUrl(urls.wsurl);
        setTokenUrl(urls.tokenurl);
    }
    if (wsUrl == "") {
    init();

    }
}, [wsUrl, tokenUrl]);

        if (wsUrl == "") {
            return (<div> <p>Server is Loading</p>
            </div>);
        } else {
            console.log(wsUrl, tokenUrl)
return ( <Xterm id="terminal-container" wsUrl={wsUrl} tokenUrl={tokenUrl} options={termOptions} />);
        }
        
}

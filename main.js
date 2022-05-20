const {app, Tray, Menu, nativeImage, dialog, MenuItem } = require('electron');
const spawn = require('cross-spawn')
const Store = require('electron-store');
const { basename } = require('path');

const schema = {
    projects: {
        type: 'string'
    }
};

const store = new Store({schema});

app.whenReady().then(() => {
    const icon = nativeImage.createFromPath('./assets/iconTemplate.png')
    mainTray = new Tray(icon);
    render(mainTray)
    
});

function render(tray = mainTray){
    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];
    const items = projects.map(({name, path}) => ({
        label: name,
        submenu: [{
            label: 'Open',
            click: () => {
                spawn('code', [path], {shell: true});
            },},
            {
            label: 'Remove',
            click: () => {
                store.set('projects', JSON.stringify(projects.filter(item => item.path !== path)));
                render();
            },}
        ]
    }))
    const contextMenu = Menu.buildFromTemplate([
        ...items, {
            type: 'separator'
        },
        {label: 'Exit', type: 'normal', role: 'quit'}
    ]);

    contextMenu.insert(0, new MenuItem({
        label: 'Add Project...', click: ()=>{
        const result  = dialog.showOpenDialogSync({properties: ['openDirectory']});

        if(!result) return;

        const [path] = result;
        const name = basename(path);
        
        store.set('projects', JSON.stringify([...projects,{
            path,
            name
        }]))
        render();
        }}
    ));

    tray.setContextMenu(contextMenu);
}
/**
 * Created by Jack V on 10/15/2017.
 */

let mql = {};
let mqlSmall = {};

export default
{
    initMql: () =>
    {
        mql = typeof window !== 'undefined' ? window.matchMedia("screen and (min-width: 800px)") : {};
        mqlSmall = typeof window !== 'undefined' ? window.matchMedia('screen and (max-width : 320px)') || window.matchMedia('screen and (max-width : 360px)') : {};
    },
    mediaQueryChanged: (scope) =>
    {
        scope.setState({
            mql:  mql,
            mqlSmall:  mqlSmall,
            smallDevice:  mql.matches,
            verySmallDevice:  mqlSmall.matches
        });

        let mainContent = document.getElementById('mainContent');

        if (!mql.matches)
        {
            document.getElementById('mobileHeader').style.display = 'flex';
            document.getElementById('wdHeader').style.display = 'none';
            document.getElementById('subMenu').style.display = 'none';
            if(mainContent)
            {
                mainContent.className = 'main-content-small-screen';
            }
        }
        else
        {
            document.getElementById('wdHeader').style.display = 'flex';
            document.getElementById('mobileHeader').style.display = 'none';
            document.getElementById('subMenu').style.display = '';
            if(mainContent)
            {
                mainContent.className = 'main-content';
            }
        }
    },
    afterComponentMounted: (scope)=>
    {
        scope.setState({
            mql:  mql,
            mqlSmall:  mqlSmall,
            smallDevice:  mql.matches,
            verySmallDevice:  mqlSmall.matches
        });

        if(typeof window !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }

        let mainContent = document.getElementById('mainContent');

        if (!mql.matches)
        {
            if(mainContent)
            {
                mainContent.className = 'main-content-small-screen';
            }
        }
        else
        {
            document.getElementById('subMenu').style.display = '';
            if(mainContent)
            {
                mainContent.className = 'main-content';
            }
        }
    },
    componentWillBeUnmounted: (scope) => 
    {
        mql.removeListener(this.mediaQueryChanged);
        if(typeof window !== 'undefined')
        {
            mql.addListener(this.mediaQueryChanged) ;
            scope.setState({ mql: mql, smallDevice: mql.matches, mqlSmall: mqlSmall, verySmallDevice: mqlSmall.matches});
        }
    },
    componentWillBeMounted: (scope) =>
    {
        if(typeof window !== 'undefined')
        {
            mql.addListener(this.mediaQueryChanged) ;
            scope.setState({ mql: mql, smallDevice: mql.matches, mqlSmall: mqlSmall, verySmallDevice: mqlSmall.matches});
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }
}
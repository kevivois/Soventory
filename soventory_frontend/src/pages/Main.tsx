import { Routes ,Route } from 'react-router-dom';
import Login from './Login';

export default  function Main()
{
    return (
        <div>
            <Routes>
                <Route path="/" element={<p>test</p>} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </div>
    );
}

import React, { useCallback,useState } from "react";
import {Form,Input, Button,Card, Typography } from 'antd';
import axios from "axios";
const FindForm = () => {
    const { Title } = Typography;
    const [userEmail, setUserEmail] = useState('');
    const onChangeUserEmail = useCallback((e)=>{
        setUserEmail(e.target.value);
    })
    const onSearchPassword = useCallback(async ()=>{
        console.log(userEmail);
       const response = await axios.post(`http://localhost:3065/user/email/${userEmail}`,{},{
            withCredentials: true,
        })
    },[userEmail])

    //////////////////////////////
    return (
        <div style={{
          width: '100%',         // form이 div 꽉 채우도록
          maxWidth: '700px',     // 실제 form 너비 제한
          margin: '0 auto',      // 가운데 정렬
          //border: '1px solid #ccc',
          padding: '20px',
          paddingRight: '120px',
          boxSizing: 'border-box',
          
        }}>
            <Card title="">
                <Title level={4}>비밀번호 찾기</Title>
                
                <Form onFinish={onSearchPassword}>
                    <span style={{fontSize:"10px", color:"lightgray"}}>이메일로 비밀번호 변경 메일이 발송됩니다.</span>
                    <Form.Item 
                    >
                        <Input type="" value={userEmail} onChange={onChangeUserEmail} placeholder="email"/>
                    </Form.Item>
                    <Button type="primary" style={{width:'100%'}} htmlType="submit" className="email-form-button">
                        비밀번호 찾기
                    </Button>
                </Form>
            </Card>
        </div>
    );
}

export default FindForm;
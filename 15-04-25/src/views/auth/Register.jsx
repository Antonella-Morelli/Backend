import React, { useState } from 'react'
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            alert('Le password non corrispondono!')
            return
        }

        try {
            const response = await fetch('http://localhost:5000/authors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    nome: 'Nome',
                    cognome: 'Cognome',
                    dataDiNascita: '1990-01-01',
                    avatar: '',
                }),
            })

            const data = await response.json()

            if (response.ok) {
                alert('Registrazione avvenuta con successo! Ora puoi fare il login.')
                navigate('/login')
            } else {
                alert(data.error || 'Errore durante la registrazione')
            }
        } catch (err) {
            console.error('Errore registrazione:', err)
            alert('Impossibile registrarsi, riprova più tardi')
        }
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">Registrati</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formConfirmPassword">
                                    <Form.Label>Conferma Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Conferma la tua password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" block>
                                    Registrati
                                </Button>
                            </Form>
                            <div className="mt-3 text-center">
                                <p>Hai già un account? <a href="/login">Accedi</a></p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Register

import React, { useCallback, useState, useEffect } from "react";
import { Button, Container, Form, Alert } from "react-bootstrap";
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import "./styles.css";
import { convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";

const NewBlogPost = () => {
  const [text, setText] = useState("")
  const [authors, setAuthors] = useState([])
  const [selectedAuthor, setSelectedAuthor] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [cover, setCover] = useState("")
  const [readTimeValue, setReadTimeValue] = useState("")
  const [readTimeUnit, setReadTimeUnit] = useState("minutes")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch 
  useEffect(() => {
    fetch("http://localhost:3001/authors")
      .then(response => response.json())
      .then(data => setAuthors(data))
      .catch(error => console.error("Error fetching authors:", error))
  }, [])

  const handleChange = useCallback((value) => {
    setText(draftToHtml(value))
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!category || !title || !cover || !readTimeValue || !selectedAuthor || !text) {
      setError("Tutti i campi obbligatori devono essere compilati.")
      setSuccessMessage("")
      return
    }
    setError("")

    const postData = {
      title,
      category,
      cover,
      readTime: {
        value: readTimeValue,
        unit: readTimeUnit,
      },
      author: selectedAuthor, 
      content: text,
    }

    fetch("http://localhost:3002/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError("Si è verificato un errore durante la creazione del post.")
          setSuccessMessage("")
        } else {
          setSuccessMessage("Post creato con successo!")
          setTitle("")
          setCategory("")
          setCover("")
          setReadTimeValue("")
          setReadTimeUnit("minutes")
          setSelectedAuthor("")
          setText("")
        }
      })
      .catch(error => {
        setError("Si è verificato un errore. Riprova più tardi.")
        setSuccessMessage("")
      })
  }

  return (
    <Container className="new-blog-container">
      <Form className="mt-5" onSubmit={handleSubmit}>
        <Form.Group controlId="blog-form" className="mt-3">
          <Form.Label>Titolo</Form.Label>
          <Form.Control
            size="lg"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="blog-category" className="mt-3">
          <Form.Label>Categoria</Form.Label>
          <Form.Control
            size="lg"
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Seleziona categoria</option>
            <option>Categoria 1</option>
            <option>Categoria 2</option>
            <option>Categoria 3</option>
            <option>Categoria 4</option>
            <option>Categoria 5</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="blog-cover" className="mt-3">
          <Form.Label>Cover Immagine (URL)</Form.Label>
          <Form.Control
            size="lg"
            type="text"
            placeholder="Inserisci URL immagine"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="blog-readTime" className="mt-3">
          <Form.Label>Tempo di lettura</Form.Label>
          <div className="d-flex">
            <Form.Control
              size="lg"
              type="number"
              placeholder="Valore (es. 5)"
              value={readTimeValue}
              onChange={(e) => setReadTimeValue(e.target.value)}
            />
            <Form.Control
              size="lg"
              as="select"
              value={readTimeUnit}
              onChange={(e) => setReadTimeUnit(e.target.value)}
            >
              <option value="minutes">Minuti</option>
              <option value="hours">Ore</option>
            </Form.Control>
          </div>
        </Form.Group>
        <Form.Group controlId="blog-author" className="mt-3">
          <Form.Label>Autore</Form.Label>
          <Form.Control
            size="lg"
            as="select"
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
          >
            <option value="">Seleziona autore</option>
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.nome} {author.cognome}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="blog-content" className="mt-3">
          <Form.Label>Contenuto Blog</Form.Label>
          <Editor value={text} onChange={handleChange} className="new-blog-content" />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form.Group className="d-flex mt-3 justify-content-end">
          <Button type="reset" size="lg" variant="outline-dark">
            Reset
          </Button>
          <Button
            type="submit"
            size="lg"
            variant="dark"
            style={{
              marginLeft: "1em",
            }}
          >
            Invia
          </Button>
        </Form.Group>
      </Form>
    </Container>
  )
}

export default NewBlogPost

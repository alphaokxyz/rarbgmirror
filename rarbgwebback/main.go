package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

type RequestBody struct {
	Title    string `json:"title"`
	Page     int    `json:"page"`
	PageSize int    `json:"pageSize"`
}

type Result struct {
	ID    int64  `db:"idinfo" json:"id"`
	Hash  string `db:"hashinfo" json:"hash"`
	Title string `db:"titleinfo" json:"title"`
	Date  string `db:"dateinfo" json:"date"`
	Size  int64  `db:"sizeinfo" json:"size"`
}

func main() {
	// 替换为 MySQL 数据库连接
	db, err := sql.Open("mysql", "root:password@tcp(127.0.0.1:3306)/rarbg")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Set up Gin router
	router := gin.Default()

	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	router.POST("/search", func(c *gin.Context) {
		var requestBody RequestBody

		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Split the title into individual words
		titleParts := strings.Fields(requestBody.Title)

		// Define filter criteria with a regex for each word
		var likeFilters []string
		for _, part := range titleParts {
			likeFilters = append(likeFilters, "titleinfo LIKE '%"+part+"%'")
		}

		// Combine LIKE filters with an AND condition
		whereClause := strings.Join(likeFilters, " AND ")

		// Pagination
		page := requestBody.Page
		pageSize := requestBody.PageSize
		offset := (page - 1) * pageSize

		// Execute the query with pagination
		rows, err := db.QueryContext(
			context.TODO(),
			"SELECT * FROM info WHERE "+whereClause+" LIMIT ?, ?",
			offset, pageSize,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		// Iterate through the rows and build results
		var results []Result
		for rows.Next() {
			var result Result
			if err := rows.Scan(
				&result.ID,
				&result.Hash,
				&result.Title,
				&result.Date,
				&result.Size,
			); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			results = append(results, result)
		}

		c.JSON(http.StatusOK, results)
	})

	// Run the server
	err = router.Run(":8080")
	if err != nil {
		log.Fatal(err)
	}
}
